"use client"

import { BASE_URL } from "@/app/config";
import { MachineInfo } from "@/app/machines/[id]/page";
import { MachineCardProps } from "@/components/ui/dashboard_machine_card";
import Sidebar from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/dist/client/components/navigation";

export default function MachinePage(){
    const params = useParams();
    const machineId = Array.isArray(params.id) ? params.id[0] : params.id;

    const router = useRouter();

    const [machine, setMachine] = useState<MachineCardProps | null>(null);

    async function handleStartSession(){
        const res = await fetch(`${BASE_URL}/api/machines/start-session/${machineId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        const data = await res.json();
        if(res.ok){
            router.push(`/sessions/${data.session.id}`)
            console.log(data);
        }
    }

    useEffect(() => {
        const fetchMachine = async () => {
            const res = await fetch(`${BASE_URL}/api/machines/get/${machineId}`,
            {
                method : "GET",
                headers: {
                "Content-Type": "application/json",
                },
                credentials: "include"
            });
            const data = await res.json();
            setMachine(data.machine);
        };
        fetchMachine();
    }, [machineId]);

    
    return (
        <div className="min-h-screen flex bg-[#020617] text-white">
            <Sidebar />
            
            <div className="flex-1 p-6 ">
                    
            <div className="p-6 text-center">
                <h1 className="text-4xl font-bold mb-2">Connect to Machine</h1>
                <p className="text-gray-400 mb-4 text-xl">
                    Check your requiremets and Connect to Machine
                </p>
            </div>
    
    
            <div className="flex w-full justify-center items-center gap-6 mt-4">
                {machine ? (
                    <div className="flex w-full justify-center flex-col items-center gap-6 mt-4">
                        <MachineInfo machine={machine as MachineCardProps}/>
                        <div>
                            <button
                            onClick={() => handleStartSession()}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-md text-xl font-medium transition">
                                Start Session
                            </button>
                        </div>
                    </div>
                    
                ) : (
                    <div>
                        <p>loading...</p>
                    </div>
                )}
            </div>
    
            </div>
        </div>
    );
}