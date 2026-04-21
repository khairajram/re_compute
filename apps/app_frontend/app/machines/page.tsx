"use client";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import MachineCard, { MachineCardProps } from "@/components/ui/machine";
import { Filters } from "@/components/ui/machineSearch";
import StatsSection from "@/components/ui/machineStatsCard";

export default function Machines() {


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<MachineCardProps[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "offline">("all");
  const [sortRam, setSortRam] = useState<"none" | "high" | "low">("none");

  const stats = {
    total: machines.length,
    active: machines.filter((m) => m.isActive).length,
    totalHours: machines.length * 6.5, // example logic
    totalSpent: machines.reduce((acc, m) => acc + m.pricePerHour, 0),
  };

  useEffect(() => {
    const fetchMachines = async () => {
      setError(null);
      setLoading(true);

      try {


      const res = await fetch(`${BASE_URL}/api/machines/get`, {
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

      <div className="flex-1 p-6">

        {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-900 border border-red-500/20 p-2 rounded-lg text-center">
              {error}
            </div>
        )}
        
        <div className="">
          <h1 className="text-4xl font-bold mb-2  w-full flex justify-center">Machines</h1>
          <p className="text-gray-400 mb-4 w-full flex justify-center text-xl">
            Here you can view and manage all your machines. See details, start/stop, and access each machine from this dashboard.
          </p>
        </div>


        <div className="flax w-full h-full" >
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
              {/* {Array.from({ length: 6 }).map((_, i) => (
                <MachineCardSkeleton key={i} />
              ))} */}

              loading...
            </div>
          )}

          {!loading && machines.length === 0 && (
            <div className="w-full flex justify-center mt-10 text-gray-400">
              No machines found. Create your first machine to get started!
            </div>
          )}

          {!loading && machines.length > 0 && (
            <div>
            
            <div>
                      {/* <StatsSection stats={stats} />
                      <Filters
                        search={search}
                        setSearch={setSearch}
                        status={status}
                        setStatus={setStatus}
                        sortRam={sortRam}
                        setSortRam={setSortRam}
                      /> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {filteredMachines.map((machine) => (
              <MachineCard key={machine.name} {...machine} />
            ))}
          </div>

            </div>
          )}
        </div>


      </div>
    </div>
  );
}