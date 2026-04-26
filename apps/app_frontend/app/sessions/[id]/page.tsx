"use client";
import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import Sidebar from "@/components/ui/sidebar";
import { BASE_URL } from "@/app/config";
import { useParams, useRouter } from "next/navigation";
import { Terminal as TerminalIcon, Activity, Clock, ArrowLeft } from "lucide-react";

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

const TerminalPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([
    "Welcome to ReCompute Terminal 🚀",
    "Initializing connection...",
    "Establishing secure tunnel...",
    "Connection established.",
    "Type 'help' to see available commands",
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/machines/get-session`, {
                method : "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include"
            });
            const data = await res.json();
            if (data.success && data.session) {
                // Find the specific session by id
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

  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.focus();
    }
  }, [history]);

  useEffect(() => {
    if (terminalEndRef.current) {
        terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    let output = "";

    switch (cmd.toLowerCase()) {
      case "help":
        output = "Available commands: help, clear, about, date, whoami, neofetch";
        break;
      case "about":
        output = "ReCompute Terminal Interface v1.0.0\nConnected to decentralized compute node.";
        break;
      case "date":
        output = new Date().toString();
        break;
      case "whoami":
        output = "root";
        break;
      case "neofetch":
        output = session ? `
            .-/+oossssoo+/-.               root@${session.machine.name}
        \`:+ssssssssssssssssss+:\`           -------------------
      -+ssssssssssssssssssyyssss+-         OS: ReCompute OS x86_64
    .ossssssssssssssssssdMMMNysssso.       Host: Decentralized Node
   /ssssssssssshdmmNNmmyNMMMMhssssss/      Kernel: 5.15.0-generic
  +ssssssssshmydMMMMMMMNddddyssssssss+     Uptime: ${Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / 60000)} mins
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/    Packages: 1337 (dpkg)
.ssssssssdMMMNhsssssssssshNMMMdssssssss.   Shell: bash 5.1.16
+sssssssNMMNyosssssssssssssyNMMMyssssss+   CPU: ${session.machine.cpu} Cores
ossssssyMMNyssssssssssssssssshNMMNysssssso RAM: ${session.machine.ram} MB
ossssssyMMNyssssssssssssssssshNMMNysssssso GPU: ${session.machine.gpu} Cores
+sssssssNMMNyosssssssssssssyNMMMyssssss+   
.ssssssssdMMMNhsssssssssshNMMMdssssssss.   
 /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/    
  +sssssssssdmydMMMMMMMMddddyssssssss+     
   /ssssssssssshdmmNNmmyNMMMMhssssss/      
    .ossssssssssssssssssdMMMNysssso.       
      -+sssssssssssssssssyyyssss+-         
        \`:+ssssssssssssssssss+:\`           
            .-/+oossssoo+/-.               
        ` : "System information not available.";
        break;
      case "clear":
        setHistory([]);
        return;
      case "":
        return;
      default:
        output = `bash: ${cmd}: command not found`;
    }

    setHistory((prev) => [...prev, `root@machine:~# ${cmd}`]);
    if (output) {
        // Handle multi-line output
        const lines = output.split('\n');
        setHistory((prev) => [...prev, ...lines]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input.trim());
    setInput("");
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-white">
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-screen">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 bg-[#050a14] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/sessions')}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="w-5 h-5 text-primary" />
                        <h1 className="text-xl font-bold">Terminal</h1>
                    </div>
                </div>
                
                {session && (
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Activity className="w-4 h-4 text-green-400" />
                            Connected to: <span className="text-white font-medium">{session.machine.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            Session: <span className="text-white">#{session.id}</span>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-medium text-xs">
                            {session.status}
                        </div>
                    </div>
                )}
            </div>

            {/* Terminal Area */}
            <div className="flex-1 p-6 bg-[#020617] overflow-hidden flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : !session ? (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-gray-400">
                        <TerminalIcon className="w-16 h-16 text-gray-600" />
                        <p className="text-xl">Session not found or connection lost.</p>
                        <button 
                            onClick={() => router.push('/sessions')}
                            className="text-primary hover:underline"
                        >
                            Return to Sessions
                        </button>
                    </div>
                ) : (
                    <div 
                        className="flex-1 bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-2xl p-4 font-mono text-sm overflow-y-auto"
                        onClick={() => inputRef.current?.focus()}
                    >
                        <div className="pb-4">
                            {history.map((line, index) => (
                                <div key={index} className={`${line.startsWith('root@') ? 'text-green-400 mt-1' : 'text-gray-300 whitespace-pre-wrap'} min-h-[1.5rem]`}>
                                    {line}
                                </div>
                            ))}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex mt-1">
                            <span className="text-green-400 mr-2">root@machine:~#</span>
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="bg-transparent outline-none flex-1 text-gray-100"
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </form>
                        <div ref={terminalEndRef} />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default TerminalPage;