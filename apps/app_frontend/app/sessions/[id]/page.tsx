"use client";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import { BASE_URL, WEBSOCKET_URL } from "@/app/config";
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
  FileText,
  ChevronDown,
  ChevronUp,
  Sidebar as SidebarIcon,
  Palette
} from "lucide-react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface MachineInfo {
  id: string;
  name: string;
  cpu: number;
  interactive?: boolean;
  isDemo?: boolean;
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

interface CreatingNodeState {
  parentPath: string;
  isDirectory: boolean;
}

const NewNodeInput = ({
  isDirectory,
  onSubmit,
  onCancel
}: {
  isDirectory: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
      } else {
        onCancel();
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="pl-4 py-1 flex items-center gap-2">
      {isDirectory ? (
        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
      ) : (
        <FileCode className="w-4 h-4 text-gray-500 shrink-0" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        className="w-full bg-[#090d16] border border-green-500 text-xs px-1.5 py-0.5 rounded text-white outline-none focus:ring-1 focus:ring-green-500"
        placeholder={isDirectory ? "folder name..." : "file name..."}
      />
    </div>
  );
};

const FileTreeItem = ({
  node,
  onSelectFile,
  activeFilePath,
  onDeleteNode,
  onCreateNode,
  expandedPaths,
  toggleExpand,
  creatingNode,
  onSubmitNewNode,
  setCreatingNode
}: {
  node: FileNode;
  onSelectFile: (path: string) => void;
  activeFilePath: string | null;
  onDeleteNode: (path: string) => void;
  onCreateNode: (parentPath: string, isDirectory: boolean) => void;
  expandedPaths: Set<string>;
  toggleExpand: (path: string) => void;
  creatingNode: CreatingNodeState | null;
  onSubmitNewNode: (parentPath: string, name: string, isDirectory: boolean) => void;
  setCreatingNode: (state: CreatingNodeState | null) => void;
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
        
        {isExpanded && (
          <div className="mt-0.5 border-l border-gray-800 ml-3.5">
            {/* Inline creation input under this specific directory */}
            {creatingNode && creatingNode.parentPath === node.path && (
              <NewNodeInput 
                isDirectory={creatingNode.isDirectory}
                onSubmit={(name) => onSubmitNewNode(node.path, name, creatingNode.isDirectory)}
                onCancel={() => setCreatingNode(null)}
              />
            )}
            {node.children && node.children.map((child, i) => (
              <FileTreeItem 
                key={i}
                node={child}
                onSelectFile={onSelectFile}
                activeFilePath={activeFilePath}
                onDeleteNode={onDeleteNode}
                onCreateNode={onCreateNode}
                expandedPaths={expandedPaths}
                toggleExpand={toggleExpand}
                creatingNode={creatingNode}
                onSubmitNewNode={onSubmitNewNode}
                setCreatingNode={setCreatingNode}
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

  // Layout resize and minimize states
  const [explorerWidth, setExplorerWidth] = useState(240);
  const [explorerMinimized, setExplorerMinimized] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  
  // Ref to synchronously track active file path and avoid websocket closure race conditions
  const activeFilePathRef = useRef<string | null>(null);
  
  // Inline node creation state
  const [creatingNode, setCreatingNode] = useState<CreatingNodeState | null>(null);

  const [demoTimeRemaining, setDemoTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!session || !session.machine.isDemo) return;

    const calculateTime = () => {
      const start = new Date(session.startTime).getTime();
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1200 - Math.floor(elapsed / 1000));
      setDemoTimeRemaining(remaining);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    // Register C++ autocomplete provider
    const cppProvider = monaco.languages.registerCompletionItemProvider("cpp", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // Keywords
          ...[
            "int", "double", "float", "char", "string", "bool", "void",
            "class", "struct", "public", "private", "protected",
            "if", "else", "for", "while", "do", "switch", "case",
            "break", "continue", "return", "using", "namespace", "std",
            "cout", "cin", "endl", "vector", "include", "define", "const"
          ].map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range
          })),
          // Snippets
          {
            label: "main",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "int main() {\n\t$0\n\treturn 0;\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Standard C++ main function",
            range
          },
          {
            label: "#include <iostream>",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <iostream>\n",
            documentation: "Include standard input/output stream",
            range
          },
          {
            label: "#include <vector>",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <vector>\n",
            documentation: "Include vector container sequence",
            range
          },
          {
            label: "#include <string>",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <string>\n",
            documentation: "Include string class library",
            range
          },
          {
            label: "#include <algorithm>",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#include <algorithm>\n",
            documentation: "Include algorithm library (sort, search, etc.)",
            range
          },
          {
            label: "cout",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "std::cout << $1 << std::endl;",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Standard cout print statement",
            range
          },
          {
            label: "vector",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "std::vector<${1:int}> ${2:vec};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Declare a std::vector",
            range
          },
          {
            label: "for loop",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for (int i = 0; i < ${1:count}; i++) {\n\t$0\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Standard for loop",
            range
          }
        ];

        return { suggestions };
      }
    });

    return () => {
      cppProvider.dispose();
    };
  }, [monaco]);

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
      case "rs":
        return "rust";
      case "cpp":
      case "cxx":
      case "cc":
      case "c":
      case "h":
      case "hpp":
        return "cpp";
      case "java":
        return "java";
      case "cs":
        return "csharp";
      case "sh":
      case "bash":
        return "shell";
      case "sql":
        return "sql";
      case "yaml":
      case "yml":
        return "yaml";
      default:
        return "plaintext";
    }
  };

  // Drag resizer handlers
  const startResizeExplorer = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = explorerWidth;

    const doDrag = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth > 150 && newWidth < 500) {
        setExplorerWidth(newWidth);
        setExplorerMinimized(false);
      }
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startResizeTerminal = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const doDrag = (moveEvent: MouseEvent) => {
      const newHeight = startHeight - (moveEvent.clientY - startY);
      if (newHeight > 80 && newHeight < 550) {
        setTerminalHeight(newHeight);
        setTerminalMinimized(false);
      }
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
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
    
    const ws = new WebSocket(WEBSOCKET_URL);
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
        
        if (data.type === "DEMO_TIMEOUT") {
          alert(data.message);
          router.push("/dashboard");
          return;
        }
        
        if (data.type === "PTY_OUTPUT" && data.sessionId === sessionId) {
          if (xtermRef.current) {
            xtermRef.current.write(data.data);
          }
        } else if (data.type === "FILE_STRUCTURE" && data.sessionId === sessionId) {
          setFileTree(data.files || []);
        } else if (data.type === "FILE_CONTENT" && data.sessionId === sessionId) {
          if (data.path === activeFilePathRef.current) {
            if (data.error) {
              setFileContent(`/* Error reading file: ${data.error} */`);
              setSaveStatus(null);
            } else {
              setFileContent(data.content || "");
              setSaveStatus("saved");
            }
          }
        } else if (data.type === "WRITE_FILE_SUCCESS" && data.sessionId === sessionId) {
          if (data.path === activeFilePathRef.current) {
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
  }, [session, sessionId]);

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

  // Handle terminal fit resize when height state updates
  useEffect(() => {
    if (xtermRef.current && !terminalMinimized) {
      setTimeout(() => {
        try {
          const fitAddon = xtermRef.current._addons?.find((a: any) => a.fit);
          if (fitAddon) {
            fitAddon.fit();
          }
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: "PTY_RESIZE",
              machineId: session?.machine.id,
              sessionId: sessionId,
              cols: xtermRef.current.cols,
              rows: xtermRef.current.rows
            }));
          }
        } catch (err) {
          console.error("Fit resize failed:", err);
        }
      }, 50);
    }
  }, [terminalHeight, terminalMinimized, session, sessionId]);

  const handleSelectFile = (filePath: string) => {
    if (saveStatus === "unsaved" && activeFilePathRef.current) {
      triggerSave(activeFilePathRef.current, fileContent);
    }
    
    activeFilePathRef.current = filePath;
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
    if (parentPath) {
      setExpandedPaths(prev => {
        const next = new Set(prev);
        next.add(parentPath);
        return next;
      });
    }
    setCreatingNode({ parentPath, isDirectory });
  };

  const onSubmitNewNode = (parentPath: string, name: string, isDirectory: boolean) => {
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
    setCreatingNode(null);
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
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden select-none">
      <Sidebar defaultCollapsed={true} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 bg-[#050a14] flex items-center justify-between px-6 shrink-0 z-10 select-none">
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
            
            {/* Sidebar toggle shortcut */}
            <button 
              onClick={() => setExplorerMinimized(!explorerMinimized)}
              title="Toggle Sidebar Explorer"
              className={`p-1.5 hover:bg-gray-800 rounded-lg transition-colors ${!explorerMinimized ? "text-green-500" : "text-gray-400"}`}
            >
              <SidebarIcon className="w-4 h-4" />
            </button>
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
              {session.machine.isDemo && demoTimeRemaining !== null && (
                <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md font-mono animate-pulse select-none">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Demo Ends: {formatTime(demoTimeRemaining)}</span>
                </div>
              )}
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
            <div 
              style={{ width: explorerMinimized ? 0 : explorerWidth }}
              className="border-r border-gray-800 bg-[#030712] flex flex-col shrink-0 overflow-hidden transition-all duration-150 ease-out"
            >
              <div className="p-3 border-b border-gray-800 flex items-center justify-between select-none">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspace</span>
                <div className="flex items-center gap-1">
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
                  <button 
                    onClick={() => setExplorerMinimized(true)}
                    title="Minimize Sidebar"
                    className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin select-none">
                {/* Inline root node creation */}
                {creatingNode && creatingNode.parentPath === "" && (
                  <NewNodeInput 
                    isDirectory={creatingNode.isDirectory}
                    onSubmit={(name) => onSubmitNewNode("", name, creatingNode.isDirectory)}
                    onCancel={() => setCreatingNode(null)}
                  />
                )}
                {fileTree.length === 0 && !creatingNode ? (
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
                      creatingNode={creatingNode}
                      onSubmitNewNode={onSubmitNewNode}
                      setCreatingNode={setCreatingNode}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Vertical drag divider */}
            {!explorerMinimized && (
              <div 
                onMouseDown={startResizeExplorer}
                className="w-1 hover:w-1.5 bg-gray-850 hover:bg-green-500 cursor-col-resize select-none shrink-0 transition-all z-20"
              />
            )}

            {/* Monaco Editor and Terminal container */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#020617]">
              {/* Editor Workspace */}
              <div className="flex-1 flex flex-col overflow-hidden relative select-text">
                {activeFilePath ? (
                  <>
                    {/* Tab Header */}
                    <div className="h-9 bg-[#040814] border-b border-gray-800 flex items-center justify-between px-4 text-xs shrink-0 select-none z-10">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FileText className="w-3.5 h-3.5 text-green-500" />
                        <span className="font-medium">{activeFilePath}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Auto-save Status */}
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

                        {/* Theme Dropdown */}
                        <div className="flex items-center gap-1.5 border-l border-gray-800 pl-3">
                          <Palette className="w-3.5 h-3.5 text-gray-400" />
                          <select 
                            value={editorTheme}
                            onChange={(e) => setEditorTheme(e.target.value)}
                            className="bg-[#090d16] border border-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded outline-none focus:border-green-500 cursor-pointer"
                          >
                            <option value="vs-dark">Dark Theme</option>
                            <option value="light">Light Theme</option>
                            <option value="hc-black">High Contrast</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {/* Editor view */}
                    <div className="flex-1 w-full overflow-hidden bg-[#020617] relative">
                      <Editor
                        height="100%"
                        theme={editorTheme}
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
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500 select-none">
                    <FileCode className="w-12 h-12 text-gray-700" />
                    <p className="text-sm">Select a file from the workspace explorer to begin coding</p>
                  </div>
                )}
              </div>

              {/* Horizontal drag divider */}
              {!terminalMinimized && (
                <div 
                  onMouseDown={startResizeTerminal}
                  className="h-1 hover:h-1.5 bg-gray-850 hover:bg-green-500 cursor-row-resize select-none shrink-0 transition-all z-20"
                />
              )}

              {/* Terminal Panel */}
              <div 
                style={{ height: terminalMinimized ? 32 : terminalHeight }}
                className="border-t border-gray-800 bg-[#080b12] flex flex-col shrink-0 overflow-hidden transition-all duration-150 ease-out"
              >
                <div className="h-8 bg-[#050a14] border-b border-gray-800/80 px-4 flex items-center justify-between shrink-0 select-none">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TerminalIcon className="w-3.5 h-3.5 text-gray-500" /> Terminal Shell
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                      Live
                    </span>
                    <button
                      onClick={() => setTerminalMinimized(!terminalMinimized)}
                      title={terminalMinimized ? "Expand Terminal" : "Minimize Terminal"}
                      className="p-0.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                    >
                      {terminalMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div 
                  className={`flex-1 p-2 relative overflow-hidden cursor-text select-text ${terminalMinimized ? "hidden" : "block"}`}
                  onClick={() => xtermRef.current?.focus()}
                >
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