"use client"
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import MachineCard, { MachineCardProps } from "@/components/ui/machine";
import AddMachineModal from "@/components/ui/AddMachineModal";
import { X } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

export default function Machines() {


  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<MachineCardProps[]>([]);

  const router = useRouter();



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

  useEffect(() => {
  if (!isOpen) return;

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  document.addEventListener("keydown", handleEsc);

  // prevent background scroll
  document.body.style.overflow = "hidden";

  return () => {
    document.removeEventListener("keydown", handleEsc);
    document.body.style.overflow = "auto";
  };
}, [isOpen]);


  return (
  <div className="h-screen flex">

    <Sidebar />

    <main className="flex-1 min-w-0 min-h-0 flex flex-col">


      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AddMachineModal onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}

      {/* HEADER */}
      <div className="p-6 text-center">
        <h1 className="text-4xl font-bold mb-2">Machines</h1>
        <p className="text-gray-400 mb-4 text-xl">
          Here you can view and manage all your machines.
        </p>

        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-md text-xl font-medium transition"
        >
          Create New Machine
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mx-6 mb-4 text-sm text-red-400 bg-red-900 border border-red-500/20 p-2 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* SCROLL AREA */}
      <div className="flex-1 justify-center overflow-y-auto p-6">

        {loading && (
          <div className="text-center mt-10">loading...</div>
        )}

        {!loading && machines.length === 0 && (
          <div className="w-full flex justify-center mt-10 text-gray-400">
            No machines found. Create your first machine.
          </div>
        )}

        {!loading && machines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {machines.map((machine) => (
              <MachineCard key={machine.id} {...machine} onClick={() => {router.push(`/machines/${machine.id}`);}} />
            ))}
          </div>
        )}

      </div>

    </main>

  </div>
);
}



