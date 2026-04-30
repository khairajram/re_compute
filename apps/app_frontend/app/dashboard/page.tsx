"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/dist/client/components/navigation";
import { BASE_URL } from "../config";
import DashboardMachineCard, { MachineCardProps } from "@/components/ui/dashboard_machine_card";
import StatsSection from "@/components/ui/machineStatsCard";
import Sidebar from "@/components/ui/sidebar";

export default function Dashboard() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [machines, setMachines] = useState<MachineCardProps[]>([]);

    const router = useRouter();
  
    const stats = {
      total: machines.length,
      active: machines.filter((m) => m.isOnline).length,
      totalHours: 51,
      totalSpent: 5
    };
  
    useEffect(() => {
      const fetchMachines = async () => {
        setError(null);
        setLoading(true);
  
        try {
  
  
        const res = await fetch(`${BASE_URL}/api/machines/getall`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          throw new Error(data.message || "unable to fetch machines");
        }
  
        setMachines(data.machine);
  
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
      };
  
      fetchMachines();
    }, []);
  


  return (
    <div className="min-h-screen flex bg-[#020617] text-white">
      
      <Sidebar />

      <div className="flex-1 p-6 ">
        
        <div className="">
          <h1 className="text-2xl font-bold mb-2 ml-12">Dashboard</h1>
          <p className="text-gray-400 mb-4">
            Welcome back, charlie! Here’s an overview of your recent activity and machine stats.
          </p>
        </div>

        <div>
          <StatsSection stats={stats} />
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-4">

          {machines.map((machine) => (
            <DashboardMachineCard
              onClick={() => {router.push(`/dashboard/${machine.id}`);}}
              key={machine.id}
              id={machine.id}
              name={machine.name}
              isOnline={machine.isOnline}
              inUse={machine.inUse}
              review={machine.review}
              pricePerHour={machine.pricePerHour}
              cpu={machine.cpu}
              ram={machine.ram}
              storage={machine.storage}
              gpu={machine.gpu}
              owner={machine.owner}
            />
          ))}
        </div>

      </div>
    </div>
  );
}