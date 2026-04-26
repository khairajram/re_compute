"use client";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import MachineCard, { MachineCardProps } from "@/components/ui/machine";
import { Filters } from "@/components/ui/machineSearch";
import StatsSection from "@/components/ui/machineStatsCard";
import { Cross, CrossIcon, X } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

export default function Machines() {


  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<MachineCardProps[]>([]);

  const router = useRouter();


  const stats = {
    total: machines.length,
    online: machines.filter((m) => m.isOnline).length,
    inUse: machines.filter((m) => m.inUse).length,
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
            <AddMachine onClose={() => setIsOpen(false)} />
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




function AddMachine({ onClose }: { onClose: () => void }) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      name: formData.get("name")?.toString().trim(),
      cpu:  Number(formData.get("cpu")),
      gpu: Number(formData.get("gpu")),
      ram: Number(formData.get("ram")),
      storage: Number(formData.get("storage")),
      pricePerHour: Number(formData.get("pricePerHour")),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/machines/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to create machine");
      }

      // ✅ SUCCESS
      setSuccess(true);

      // auto close modal after 1.5s (optional)
      setTimeout(() => {
        onClose();
      }, 1500);

      // auto hide success after 5 sec
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ SUCCESS POPUP (GLOBAL FEEL) */}
      {success && (
        <div className="fixed top-5 right-5 z-[100] bg-green-600 text-white px-4 py-2 rounded-md shadow-lg animate-in fade-in">
          Machine created successfully 🚀
        </div>
      )}

      <div className="relative bg-card rounded-xl p-6 w-full max-w-md border border-card-border shadow-2xl">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Add Machine
        </h2>

        {/* ❌ ERROR */}
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900 p-2 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {[
            { label: "name", type: "text", placeholder: "Machine Name" },
            { label: "cpu", type: "number", placeholder: "CPU Count" },
            { label: "gpu", type: "number", placeholder: "GPU Count" },
            { label: "ram", type: "number", placeholder: "RAM Size (GB)" },
            { label: "storage", type: "number", placeholder: "Storage Size (GB)" },
            { label: "pricePerHour", type: "number", placeholder: "Price per Hour" },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm text-gray-400 mb-1">
                {field.label}
              </label>
              <input
                name={field.label}
                type={field.type}
                required
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-2 bg-primary rounded-md text-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Machine"}
          </button>
        </form>
      </div>
    </>
  );
}