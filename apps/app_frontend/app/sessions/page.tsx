"use client"

import { BASE_URL } from "@/app/config";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, HardDrive, MemoryStick, Activity, Clock } from "lucide-react";

interface MachineInfo {
    id: string;
    name: string;
    cpu: number;
    gpu: number;
    ram: number;
    storage: number;
    pricePerHour: number;
    inUse: boolean;
    isOnline: boolean;
}

interface SessionInfo {
    id: number;
    pricePerHour: number;
    totalCost: number | null;
    userId: number;
    machineId: string;
    startTime: string;
    endTime: string | null;
    status: string;
    createdAt: string;
    machine: MachineInfo;
}

export default function SessionsPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
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
                    setSessions(data.session);
                }
            } catch (error) {
                console.error("Failed to fetch sessions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    return (
        <div className="min-h-screen flex bg-[#020617] text-white">
            <Sidebar />

            <div className="flex-1 p-6">
                <div className="p-6 text-center">
                    <h1 className="text-4xl font-bold mb-2">Active Sessions</h1>
                    <p className="text-gray-400 mb-4 text-xl">
                        Manage and connect to your active machine sessions
                    </p>
                </div>

                <div className="flex w-full justify-center items-center gap-6 mt-4">
                    {loading ? (
                        <div className="flex justify-center items-center mt-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : sessions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-6">
                            {sessions.map(session => (
                                <SessionCard key={session.id} session={session} router={router} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center mt-10 p-10 bg-[#050a14] rounded-2xl border border-gray-800">
                            <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">No Active Sessions</h2>
                            <p className="text-gray-400 mb-6">You don't have any active machine sessions right now.</p>
                            <button onClick={() => router.push('/dashboard')} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors">
                                Browse Machines
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SessionCard({ session, router }: { session: SessionInfo, router: any }) {
    const { machine } = session;
    const startDate = new Date(session.startTime);
    const timeAlive = Math.floor((new Date().getTime() - startDate.getTime()) / 60000); // in minutes

    return (
        <div className="bg-[#050a14] text-white rounded-2xl p-5 w-full shadow-lg border border-gray-800 hover:border-primary/50 hover:border transition-all hover:shadow-primary/10 duration-400 ease-in-out">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Session #{session.id}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${session.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                            {session.status}
                        </span>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAlive} mins ago
                        </span>
                    </div>
                </div>
                <div className="text-primary font-bold text-lg text-right">
                    ${session.pricePerHour}
                    <span className="text-sm text-gray-400 font-normal">/hr</span>
                </div>
            </div>

            <div className="bg-[#0a1122] rounded-lg p-3 mb-4 border border-gray-800/50">
                <h3 className="text-sm text-gray-400 mb-2 font-medium">Machine Details ({machine.name})</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" /> <span>{machine.cpu} cores</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MemoryStick className="w-4 h-4 text-purple-400" /> <span>{machine.ram}MB</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" /> <span>GPU: {machine.gpu}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-orange-400" /> <span>{machine.storage}GB</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => router.push(`/sessions/${session.id}`)}
                className="mt-2 w-full bg-primary hover:cursor-pointer hover:bg-primary-hover text-lg transition-all text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
                <Activity className="w-5 h-5" /> Open Terminal
            </button>
        </div>
    );
}
