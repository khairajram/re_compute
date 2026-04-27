import { runCommand } from "./executor.js";

import WebSocket from "ws";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { createJobDir } from "./createJobDir.js";

dotenv.config();

const WS_URL = process.env.WS_SERVER_URL!;
const MACHINE_ID = process.env.MACHINE_ID || "machine-1";

if (!WS_URL) {
  throw new Error("WS_SERVER_URL is not defined");
}

const sessionCwds = new Map<string, string>();


let ws: WebSocket;

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
      console.log("📩 Received:", message);

      if (message.type === "SERVER_PING") {
        ws.send(JSON.stringify({ 
          type: "HOST_PONG",
          machineId: MACHINE_ID
         }));
        return;
      }

      if (message.type === "CHECK_CONFIGURATION") {
        const { command } = message;
        
        try {
          const result = await runCommand(command);
          console.log("✅ Command output:", result);

          ws.send(
            JSON.stringify({
              type: "CONFIGURATION_RESULT",
              machineId: MACHINE_ID,
              success: true,
              output: result
            })
          );
        } catch (err: any) {
          ws.send(
            JSON.stringify({
              type: "CONFIGURATION_RESULT",
              machineId: MACHINE_ID,
              success: false,
              output: err
            })
          );
        }
      }



      if (message.type === "RUN_JOB") {
        const { command, sessionId } = message;

        console.log(`⚡ Received job: ${command} (Session: ${sessionId})`);

        const sessionDir = path.resolve(createJobDir(sessionId));
        let currentCwd = sessionCwds.get(sessionId) || sessionDir;

        console.log("⚡ Executing:", command, "in", currentCwd);

        const cmdTrimmed = command.trim();
        if (cmdTrimmed.startsWith("cd ") || cmdTrimmed === "cd") {
            const target = cmdTrimmed === "cd" ? "~" : cmdTrimmed.slice(3).trim();
            let newCwd;
            if (target === "~" || target.startsWith("~/")) {
                newCwd = path.resolve(sessionDir, target.replace(/^~/, '.'));
            } else {
                newCwd = path.resolve(currentCwd, target);
            }

            let output = "";
            if (!newCwd.startsWith(sessionDir)) {
                output = `bash: cd: ${target}: Permission denied (restricted to ~)`;
            } else if (!fs.existsSync(newCwd) || !fs.statSync(newCwd).isDirectory()) {
                output = `bash: cd: ${target}: No such file or directory`;
            } else {
                currentCwd = newCwd;
                sessionCwds.set(sessionId, currentCwd);
            }

            const relativeCwd = currentCwd === sessionDir ? "~" : "~" + currentCwd.slice(sessionDir.length).replace(/\\/g, '/');

            ws.send(
                JSON.stringify({
                    type: "HOST_JOB_RESULT",
                    machineId: MACHINE_ID,
                    sessionId,
                    success: !output,
                    output: output,
                    cwd: relativeCwd
                })
            );
            return;
        }

        try {
          const result = await runCommand(command, currentCwd);
          console.log("✅ Command output:", result);

          const relativeCwd = currentCwd === sessionDir ? "~" : "~" + currentCwd.slice(sessionDir.length).replace(/\\/g, '/');

          ws.send(
            JSON.stringify({
              type: "HOST_JOB_RESULT",
              machineId: MACHINE_ID,
              sessionId,
              success: true,
              output: result,
              cwd: relativeCwd
            })
          );
        } catch (err: any) {
          const relativeCwd = currentCwd === sessionDir ? "~" : "~" + currentCwd.slice(sessionDir.length).replace(/\\/g, '/');
          ws.send(
            JSON.stringify({
              type: "HOST_JOB_RESULT",
              machineId: MACHINE_ID,
              sessionId,
              success: false,
              output: err,
              cwd: relativeCwd
            })
          );
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse message:", err);
    }
  });

  
  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
  });

  ws.on("close", () => {
    console.log("🔌 Disconnected. Reconnecting in 3s...");  
    setTimeout(connect, 3000);
  });
}

connect();

// setInterval(() => {
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     ws.send(JSON.stringify({ type: "PING" }));
//   }
// }, 10000);