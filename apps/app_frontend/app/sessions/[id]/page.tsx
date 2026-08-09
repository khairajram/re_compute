"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import { BASE_URL } from "@/app/config";
import { useParams, useRouter } from "next/navigation";
import { 
  Terminal as TerminalIcon, 
  Activity, 
  Clock, 
  ArrowLeft, 
  Folder, 
  FolderOpen, 
  FileCode, 
  Trash2, 
  Plus, 
  FolderPlus,
  Save,
  Loader2,
  FileText
} from "lucide-react";
import Editor from "@monaco-editor/react";

interface MachineInfo {
  id: string;
  name: string;
  cpu: number;
  gpu: number;
  ram: number;
  storage: number;
}

interface SessionInfo {
  id: number;
  status: string;
  startTime: string;
  machine: MachineInfo;
}

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

const FileTreeItem = ({
  node,
  onSelectFile,
  activeFilePath,
  onDeleteNode,
  onCreateNode,
  expandedPaths,
  toggleExpand
}: {
  node: FileNode;
  onSelectFile: (path: string) => void;
  activeFilePath: string | null;
  onDeleteNode: (path: string) => void;
  onCreateNode: (parentPath: string, isDirectory: boolean) => void;
  expandedPaths: Set<string>;
  toggleExpand: (path: string) => void;
}) => {
  const isExpanded = expandedPaths.has(node.path);

  if (node.isDirectory) {
    return (
      <div className="pl-2">
        <div 
          className="group flex items-center justify-between py-1.5 px-2 hover:bg-gray-800/50 rounded cursor-pointer text-gray-300 hover:text-white transition-colors"
          onClick={() => toggleExpand(node.path)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="text-sm truncate select-none">{node.name}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onCreateNode(node.path, false); }}
              title="New File"
              className="p-0.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onCreateNode(node.path, true); }}
              title="New Folder"
              className="p-0.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteNode(node.path); }}
              title="Delete Folder"
              className="p-0.5 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {isExpanded && node.children && (
          <div className="mt-0.5 border-l border-gray-800 ml-3.5">
            {node.children.map((child, i) => (
              <FileTreeItem 
                key={i}
                node={child}
                onSelectFile={onSelectFile}
                activeFilePath={activeFilePath}
                onDeleteNode={onDeleteNode}
                onCreateNode={onCreateNode}
                expandedPaths={expandedPaths}
                toggleExpand={toggleExpand}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    const isActive = activeFilePath === node.path;
    return (
      <div className="pl-2">
        <div 
          className={`group flex items-center justify-between py-1.5 px-2 rounded cursor-pointer transition-colors ${
            isActive ? "bg-green-500/10 text-green-400 font-medium border-l-2 border-green-500" : "hover:bg-gray-800/40 text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => onSelectFile(node.path)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <FileCode className={`w-4 h-4 shrink-0 ${isActive ? "text-green-400" : "text-gray-500"}`} />
            <span className="text-sm truncate select-none">{node.name}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteNode(node.path); }}
              title="Delete File"
              className="p-0.5 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};

const TerminalPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // File explorer states
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | null>(null);

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getLanguage = (filePath: string | null) => {
    if (!filePath) return "plaintext";
    const ext = filePath.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      case "css":
        return "css";
      case "html":
        return "html";
      case "md":
        return "markdown";
      case "py":
        return "python";
      case "go":
        return "go";
      case "sh":
      case "bash":
        return "shell";
      case "rs":
        return "rust";
      default:
        return "plaintext";
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/machines/get-session`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        });
        const data = await res.json();
        if (data.success && data.session) {
          const currentSession = data.session.find((s: SessionInfo) => s.id.toString() === sessionId);
          if (currentSession) {
            setSession(currentSession);
          }
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  // WebSocket Connection Effect
  useEffect(() => {
    if (!session) return;
    
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      // Register client
      ws.send(JSON.stringify({
        type: "REGISTER_USER",
        machineId: session.machine.id
      }));

      // Fetch Workspace tree
      ws.send(JSON.stringify({
        type: "FETCH_FILE_STRUCTURE",
        machineId: session.machine.id,
        sessionId: sessionId
      }));

      // Start Remote Shell if Terminal DOM is mounted and ready
      if (xtermRef.current) {
        ws.send(JSON.stringify({
          type: "PTY_START",
          machineId: session.machine.id,
          sessionId: sessionId,
          cols: xtermRef.current.cols,
          rows: xtermRef.current.rows
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "PTY_OUTPUT" && data.sessionId === sessionId) {
          if (xtermRef.current) {
            xtermRef.current.write(data.data);
          }
        } else if (data.type === "FILE_STRUCTURE" && data.sessionId === sessionId) {
          setFileTree(data.files || []);
        } else if (data.type === "FILE_CONTENT" && data.sessionId === sessionId) {
          if (data.path === activeFilePath) {
            if (data.error) {
              setFileContent(`/* Error reading file: ${data.error} */`);
              setSaveStatus(null);
            } else {
              setFileContent(data.content || "");
              setSaveStatus("saved");
            }
          }
        } else if (data.type === "WRITE_FILE_SUCCESS" && data.sessionId === sessionId) {
          if (data.path === activeFilePath) {
            setSaveStatus(data.success ? "saved" : "unsaved");
          }
        }
      } catch (e) {
        console.error("Failed to parse websocket payload:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Connection Closed");
    };

    return () => {
      ws.close();
    };
  }, [session, sessionId, activeFilePath]);

  // Terminal DOM initialization
  useEffect(() => {
    if (!session || !terminalRef.current) return;

    let terminal: any;
    let fitAddon: any;

    const initTerminal = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      await import("xterm/css/xterm.css");

      terminal = new Terminal({
        theme: {
          background: "#080b12",
          foreground: "#d1d5db",
          cursor: "#10b981",
          selectionBackground: "#1f2937",
        },
        fontFamily: 'var(--font-mono, Fira Code, Menlo, monospace)',
        fontSize: 13,
        cursorBlink: true,
        rows: 15,
      });

      fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalRef.current);
      fitAddon.fit();
      xtermRef.current = terminal;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "PTY_START",
          machineId: session.machine.id,
          sessionId: sessionId,
          cols: terminal.cols,
          rows: terminal.rows
        }));
      }

      terminal.onData((data: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "PTY_INPUT",
            machineId: session.machine.id,
            sessionId: sessionId,
            data
          }));
        }
      });

      const handleResize = () => {
        if (fitAddon) {
          fitAddon.fit();
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && xtermRef.current) {
            wsRef.current.send(JSON.stringify({
              type: "PTY_RESIZE",
              machineId: session.machine.id,
              sessionId: sessionId,
              cols: xtermRef.current.cols,
              rows: xtermRef.current.rows
            }));
          }
        }
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    };

    const runSetup = initTerminal();

    return () => {
      runSetup.then(() => {
        if (terminal) terminal.dispose();
      });
    };
  }, [session, sessionId]);

  const handleSelectFile = (filePath: string) => {
    if (saveStatus === "unsaved" && activeFilePath) {
      triggerSave(activeFilePath, fileContent);
    }
    
    setActiveFilePath(filePath);
    setFileContent("");
    setSaveStatus(null);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && session) {
      wsRef.current.send(JSON.stringify({
        type: "READ_FILE",
        machineId: session.machine.id,
        sessionId: sessionId,
        path: filePath
      }));
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined || !activeFilePath) return;
    setFileContent(value);
    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      triggerSave(activeFilePath, value);
    }, 5000);
  };

  const triggerSave = (path: string, content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && session) {
      setSaveStatus("saving");
      wsRef.current.send(JSON.stringify({
        type: "WRITE_FILE",
        machineId: session.machine.id,
        sessionId: sessionId,
        path: path,
        content: content
      }));
    }
  };

  const handleCreateNode = (parentPath: string, isDirectory: boolean) => {
    const name = prompt(`Enter ${isDirectory ? "folder" : "file"} name:`);
    if (!name) return;
    const newPath = parentPath ? `${parentPath}/${name}` : name;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && session) {
      wsRef.current.send(JSON.stringify({
        type: "CREATE_NODE",
        machineId: session.machine.id,
        sessionId: sessionId,
        path: newPath,
        isDirectory
      }));
    }
  };

  const handleDeleteNode = (filePath: string) => {
    if (!confirm(`Are you sure you want to delete ${filePath}?`)) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && session) {
      wsRef.current.send(JSON.stringify({
        type: "DELETE_NODE",
        machineId: session.machine.id,
        sessionId: sessionId,
        path: filePath
      }));
    }
    if (activeFilePath === filePath) {
      setActiveFilePath(null);
      setFileContent("");
      setSaveStatus(null);
    }
  };

  const handleReleaseMachine = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${BASE_URL}/api/machines/release-session/${session.machine.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error releasing machine:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 bg-[#050a14] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/sessions')}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-green-500" />
              <h1 className="text-lg font-bold">Cloud IDE</h1>
            </div>
          </div>
          
          {session && (
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Activity className="w-3.5 h-3.5 text-green-400" />
                Host: <span className="text-white font-medium">{session.machine.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                Session: <span className="text-white">#{session.id}</span>
              </div>
              <button
                onClick={handleReleaseMachine}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md font-medium transition-colors"
              >
                Release Machine
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-[#020617]">
            <Loader2 className="animate-spin w-8 h-8 text-green-500" />
          </div>
        ) : !session ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-gray-400 bg-[#020617]">
            <TerminalIcon className="w-16 h-16 text-gray-600" />
            <p className="text-lg">Session not found or connection lost.</p>
            <button 
              onClick={() => router.push('/sessions')}
              className="text-green-500 hover:underline"
            >
              Return to Sessions
            </button>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Workspace Explorer panel */}
            <div className="w-60 border-r border-gray-800 bg-[#030712] flex flex-col shrink-0">
              <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspace</span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleCreateNode("", false)}
                    title="New File"
                    className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleCreateNode("", true)}
                    title="New Folder"
                    className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {fileTree.length === 0 ? (
                  <div className="text-xs text-gray-500 p-2 text-center">Empty Workspace</div>
                ) : (
                  fileTree.map((node, i) => (
                    <FileTreeItem 
                      key={i}
                      node={node}
                      onSelectFile={handleSelectFile}
                      activeFilePath={activeFilePath}
                      onDeleteNode={handleDeleteNode}
                      onCreateNode={handleCreateNode}
                      expandedPaths={expandedPaths}
                      toggleExpand={toggleExpand}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Monaco Editor and Terminal container */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#020617]">
              {/* Editor Workspace */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {activeFilePath ? (
                  <>
                    {/* Tab Header */}
                    <div className="h-9 bg-[#040814] border-b border-gray-800 flex items-center justify-between px-4 text-xs shrink-0 select-none">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FileText className="w-3.5 h-3.5 text-green-500" />
                        <span className="font-medium">{activeFilePath}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 font-mono">
                        {saveStatus === "saving" && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                          </span>
                        )}
                        {saveStatus === "saved" && (
                          <span className="flex items-center gap-1 text-green-500">
                            <Save className="w-3 h-3" /> Saved
                          </span>
                        )}
                        {saveStatus === "unsaved" && (
                          <span className="text-gray-400">Unsaved Changes</span>
                        )}
                      </div>
                    </div>
                    {/* Editor view */}
                    <div className="flex-1 w-full overflow-hidden bg-[#020617] relative">
                      <Editor
                        height="100%"
                        theme="vs-dark"
                        language={getLanguage(activeFilePath)}
                        value={fileContent}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "var(--font-mono, Consolas, Courier New, monospace)",
                          automaticLayout: true,
                          tabSize: 2,
                          lineHeight: 22,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
                    <FileCode className="w-12 h-12 text-gray-700" />
                    <p className="text-sm">Select a file from the workspace explorer to begin coding</p>
                  </div>
                )}
              </div>

              {/* Terminal Panel */}
              <div className="h-64 border-t border-gray-800 bg-[#080b12] flex flex-col shrink-0 overflow-hidden">
                <div className="h-8 bg-[#050a14] border-b border-gray-800/80 px-4 flex items-center justify-between shrink-0 select-none">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TerminalIcon className="w-3.5 h-3.5 text-gray-500" /> Terminal Shell
                  </span>
                  <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                    Live
                  </span>
                </div>
                <div className="flex-1 p-2 relative overflow-hidden">
                  <div ref={terminalRef} className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalPage;