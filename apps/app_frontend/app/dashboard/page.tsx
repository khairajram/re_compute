"use client";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import MachineCard, { MachineCardProps } from "@/components/ui/machine";
import StatsSection from "@/components/ui/machineStatsCard";
import Sidebar from "@/components/ui/sidebar";

export default function Dashboard() {


  
  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [machines, setMachines] = useState<MachineCardProps[]>([]);
  
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"all" | "active" | "offline">("all");
    const [sortRam, setSortRam] = useState<"none" | "high" | "low">("none");
  
    const stats = {
      total: machines.length,
      active: machines.filter((m) => m.isActive).length,
      totalHours: 51, //machines.length * 6.5, // example logic
      totalSpent: 5 //machines.reduce((acc, m) => acc + m.pricePerHour, 0),
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
  
    const filteredMachines = machines
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.owner.toLowerCase().includes(search.toLowerCase()) ||
        m.gpu.toLowerCase().includes(search.toLowerCase());
  
      const matchesStatus =
        status === "all" ||
        (status === "active" && m.isActive) ||
        (status === "offline" && !m.isActive);
  
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortRam === "high") return b.ram - a.ram;
      if (sortRam === "low") return a.ram - b.ram;
      return 0;
    });

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
          <MachineCard
            name="regx"
            isActive={true}
            review={4.5}
            pricePerHour={0.45}
            cpu={16}
            ram={64}
            storage={500}
            gpu="RTX 4090"
            owner="charlie"
          />
          <MachineCard
            name="regx"
            isActive={false}
            review={4.5}
            pricePerHour={0.45}
            cpu={16}
            ram={64}
            storage={500}
            gpu="RTX 4090"
            owner="charlie"
          />
        </div>

      </div>
    </div>
  );
}