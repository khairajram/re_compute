import { runCommand } from "./executor.js";
import WebSocket from "ws";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pty from "node-pty";
import chokidar from "chokidar";
import { createJobDir } from "./createJobDir.js";
import { execSync } from "child_process";

dotenv.config();

function getOrCreateRestrictedUser(sessionId: string): { uid?: number; gid?: number } {
  if (process.platform === "win32") {
    return {};
  }
  
  // Create a safe, unique username from sessionId (UUID)
  const username = `usr_${sessionId.replace(/-/g, "").substring(0, 10)}`;
  
  try {
    // Check if user already exists
    const uid = parseInt(execSync(`id -u ${username}`, { encoding: "utf-8" }).trim(), 10);
    const gid = parseInt(execSync(`id -g ${username}`, { encoding: "utf-8" }).trim(), 10);
    return { uid, gid };
  } catch (err) {
    // User does not exist, let's create it
    try {
      execSync(`useradd -M -s /bin/bash ${username}`, { stdio: "ignore" });
      const uid = parseInt(execSync(`id -u ${username}`, { encoding: "utf-8" }).trim(), 10);
      const gid = parseInt(execSync(`id -g ${username}`, { encoding: "utf-8" }).trim(), 10);
      return { uid, gid };
    } catch (createErr) {
      console.error(`Failed to create restricted user ${username}:`, createErr);
      return {};
    }
  }
}

function chownSessionDir(sessionId: string, sessionDir: string) {
  if (process.platform === "win32") return;
  const { uid, gid } = getOrCreateRestrictedUser(sessionId);
  if (uid !== undefined && gid !== undefined) {
    try {
      execSync(`chown -R ${uid}:${gid} ${sessionDir}`, { stdio: "ignore" });
      execSync(`chmod 700 ${sessionDir}`, { stdio: "ignore" });
      
      const jobsParentDir = path.dirname(sessionDir);
      execSync(`chown root:root ${jobsParentDir}`, { stdio: "ignore" });
      execSync(`chmod 711 ${jobsParentDir}`, { stdio: "ignore" });
    } catch (e) {
      console.error("Failed to chown session dir:", e);
    }
  }
}

const WS_URL = process.env.WS_SERVER_URL!;
const MACHINE_ID = process.env.MACHINE_ID || "machine-1";

if (!WS_URL) {
  throw new Error("WS_SERVER_URL is not defined");
}

// Map of sessionId -> pty process
const ptyProcesses = new Map<string, pty.IPty>();

// Map of sessionId -> chokidar file watcher
const watchers = new Map<string, chokidar.FSWatcher>();

let ws: WebSocket;

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

// Helper to recursively get file tree
function getFileTree(dirPath: string, rootDir: string): FileNode[] {
  try {
    const items = fs.readdirSync(dirPath);
    const nodes: FileNode[] = [];
    for (const item of items) {
      if (item === "node_modules" || item === ".git" || item === ".DS_Store") continue;
      const fullPath = path.join(dirPath, item);
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
      const stat = fs.statSync(fullPath);
      const isDir = stat.isDirectory();
      if (isDir) {
        nodes.push({
          name: item,
          path: relativePath,
          isDirectory: true,
          children: getFileTree(fullPath, rootDir),
        });
      } else {
        nodes.push({
          name: item,
          path: relativePath,
          isDirectory: false,
        });
      }
    }
    // Sort: directories first, then alphabetical
    return nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (err) {
    console.error("Error reading directory structure:", err);
    return [];
  }
}

function connect() {
  ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("✅ Connected to WS server");

    ws.send(
      JSON.stringify({
        type: "REGISTER_HOST",
        machineId: MACHINE_ID
      })
    );
  });

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("📩 Received:", message.type, "Session:", message.sessionId);

      if (message.type === "SERVER_PING") {
        ws.send(JSON.stringify({ 
          type: "HOST_PONG",
          machineId: MACHINE_ID
         }));
        return;
      }

      if (message.type === "CONFIGURATION_MISMATCH") {
        console.warn("⚠️ Configuration mismatch detected. Host is incompatible with server requirements");
        return;
      }

      if (message.type === "CHECK_CONFIGURATION") {
        const { command } = message;
        try {
          const result = await runCommand(command);
          ws.send(JSON.stringify({
            type: "CONFIGURATION_RESULT",
            machineId: MACHINE_ID,
            success: true,
            output: result
          }));
        } catch (err: any) {
          ws.send(JSON.stringify({
            type: "CONFIGURATION_RESULT",
            machineId: MACHINE_ID,
            success: false,
            output: err?.toString() || "Unknown configuration error"
          }));
        }
        return;
      }

      // Legacy executor command run (optional, for compatibility)
      if (message.type === "RUN_JOB") {
        const { command, sessionId } = message;
        const sessionDir = path.resolve(createJobDir(sessionId));
        try {
          const result = await runCommand(command, sessionDir);
          ws.send(JSON.stringify({
            type: "HOST_JOB_RESULT",
            machineId: MACHINE_ID,
            sessionId,
            success: true,
            output: result,
            cwd: "~"
          }));
        } catch (err: any) {
          ws.send(JSON.stringify({
            type: "HOST_JOB_RESULT",
            machineId: MACHINE_ID,
            sessionId,
            success: false,
            output: err?.toString() || "Unknown command run error",
            cwd: "~"
          }));
        }
        return;
      }

      // ─── PTY TERMINAL MANAGEMENT ──────────────────────────────────────────────
      if (message.type === "PTY_START") {
        const { sessionId } = message;
        const sessionDir = path.resolve(createJobDir(sessionId));

        // Kill existing pty if any
        if (ptyProcesses.has(sessionId)) {
          try {
            ptyProcesses.get(sessionId)?.kill();
          } catch (e) {}
          ptyProcesses.delete(sessionId);
        }

        const shell = process.platform === "win32" ? "powershell.exe" : "bash";
        
        // Align folder permissions and obtain UID/GID
        chownSessionDir(sessionId, sessionDir);
        const { uid, gid } = getOrCreateRestrictedUser(sessionId);

        const ptyProcess = pty.spawn(shell, [], {
          name: "xterm-color",
          cols: message.cols || 80,
          rows: message.rows || 24,
          cwd: sessionDir,
          env: {
            ...process.env,
            PS1: "re_compute@agent:\\w\\$ "
          } as Record<string, string>,
          ...(uid !== undefined && gid !== undefined ? { uid, gid } : {})
        });

        ptyProcess.onData((output) => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: "PTY_OUTPUT",
              machineId: MACHINE_ID,
              sessionId,
              data: output
            }));
          }
        });

        ptyProcess.onExit(() => {
          ptyProcesses.delete(sessionId);
        });

        ptyProcesses.set(sessionId, ptyProcess);
        console.log(`🚀 Spawned PTY for Session ${sessionId}`);
        return;
      }

      if (message.type === "PTY_INPUT") {
        const { sessionId, data: inputData } = message;
        const ptyProcess = ptyProcesses.get(sessionId);
        if (ptyProcess) {
          ptyProcess.write(inputData);
        }
        return;
      }

      if (message.type === "PTY_RESIZE") {
        const { sessionId, cols, rows } = message;
        const ptyProcess = ptyProcesses.get(sessionId);
        if (ptyProcess && cols && rows) {
          try {
            ptyProcess.resize(cols, rows);
          } catch (e) {
            console.error("Failed to resize PTY:", e);
          }
        }
        return;
      }

      // ─── FILE EXPLORER & WATCHING ─────────────────────────────────────────────
      if (message.type === "FETCH_FILE_STRUCTURE") {
        const { sessionId } = message;
        const sessionDir = path.resolve(createJobDir(sessionId));
        chownSessionDir(sessionId, sessionDir);

        // Send initial structure
        const tree = getFileTree(sessionDir, sessionDir);
        ws.send(JSON.stringify({
          type: "FILE_STRUCTURE",
          machineId: MACHINE_ID,
          sessionId,
          files: tree
        }));

        // Set up chokidar watcher if not exists
        if (!watchers.has(sessionId)) {
          const watcher = chokidar.watch(sessionDir, {
            ignored: /(^|[\/\\])(node_modules|\.git|\.DS_Store)/,
            persistent: true,
            ignoreInitial: true,
            depth: 10
          });

          const broadcastChange = () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              const currentTree = getFileTree(sessionDir, sessionDir);
              ws.send(JSON.stringify({
                type: "FILE_STRUCTURE",
                machineId: MACHINE_ID,
                sessionId,
                files: currentTree
              }));
            }
          };

          watcher.on("all", () => {
            broadcastChange();
          });

          watchers.set(sessionId, watcher);
          console.log(`👀 Set up filesystem watcher for Session ${sessionId}`);
        }
        return;
      }

      // ─── FILE READ / WRITE / OPERATIONS ───────────────────────────────────────
      if (message.type === "READ_FILE") {
        const { sessionId, path: filePath } = message;
        const sessionDir = path.resolve(createJobDir(sessionId));
        const fullPath = path.resolve(sessionDir, filePath);

        // Security check
        if (!fullPath.startsWith(sessionDir)) {
          ws.send(JSON.stringify({
            type: "FILE_CONTENT",
            machineId: MACHINE_ID,
            sessionId,
            path: filePath,
            error: "Access denied"
          }));
          return;
        }

        try {
          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, "utf-8");
            ws.send(JSON.stringify({
              type: "FILE_CONTENT",
              machineId: MACHINE_ID,
              sessionId,
              path: filePath,
              content
            }));
          } else {
            throw new Error("File not found");
          }
        } catch (err: any) {
          ws.send(JSON.stringify({
            type: "FILE_CONTENT",
            machineId: MACHINE_ID,
            sessionId,
            path: filePath,
            error: err?.message || "Could not read file"
          }));
        }
        return;
      }

      if (message.type === "WRITE_FILE") {
        const { sessionId, path: filePath, content } = message;
        const sessionDir = path.resolve(createJobDir(sessionId));
        const fullPath = path.resolve(sessionDir, filePath);

        if (!fullPath.startsWith(sessionDir)) {
          ws.send(JSON.stringify({
            type: "WRITE_FILE_SUCCESS",
            machineId: MACHINE_ID,
            sessionId,
            path: filePath,
            success: false,
            error: "Access denied"
          }));
          return;
        }

        try {
          fs.writeFileSync(fullPath, content, "utf-8");
          chownSessionDir(sessionId, sessionDir);
          ws.send(JSON.stringify({
            type: "WRITE_FILE_SUCCESS",
            machineId: MACHINE_ID,
            sessionId,
            path: filePath,
            success: true
          }));
        } catch (err: any) {
          ws.send(JSON.stringify({
            type: "WRITE_FILE_SUCCESS",
            machineId: MACHINE_ID,
            sessionId,
            path: filePath,
            success: false,
            error: err?.message || "Could not write file"
          }));
        }
        return;
      }

      if (message.type === "CREATE_NODE") {
        const { sessionId, path: filePath, isDirectory } = message;
        const sessionDir = path.resolve(createJobDir(sessionId));
        const fullPath = path.resolve(sessionDir, filePath);

        if (!fullPath.startsWith(sessionDir)) return;

        try {
          if (isDirectory) {
            fs.mkdirSync(fullPath, { recursive: true });
          } else {
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, "", "utf-8");
          }
          chownSessionDir(sessionId, sessionDir);
        } catch (err) {
          console.error("Failed to create file/folder:", err);
        }
        return;
      }

      if (message.type === "DELETE_NODE") {
        const { sessionId, path: filePath } = message;
        const sessionDir = path.resolve(createJobDir(sessionId));
        const fullPath = path.resolve(sessionDir, filePath);

        if (!fullPath.startsWith(sessionDir)) return;

        try {
          if (fs.existsSync(fullPath)) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          }
        } catch (err) {
          console.error("Failed to delete file/folder:", err);
        }
        return;
      }

    } catch (err) {
      console.error("❌ Failed to parse/handle message:", err);
    }
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
  });

  ws.on("close", () => {
    console.log("🔌 Disconnected. Reconnecting in 3s...");
    
    // Cleanup active PTY processes and watchers on disconnect
    for (const [sid, proc] of ptyProcesses) {
      try { proc.kill(); } catch (e) {}
    }
    ptyProcesses.clear();

    for (const [sid, watcher] of watchers) {
      try { watcher.close(); } catch (e) {}
    }
    watchers.clear();

    setTimeout(connect, 3000);
  });
}

connect();