"use client";

import { BASE_URL } from "@/app/config";
import { MachineCardProps } from "@/components/ui/machine";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WEBSOCKET_URL } from "../../config";
import { Copy } from "lucide-react";

export default function MachinePage() {
  const params = useParams();

  const machineId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machine, setMachine] = useState<MachineCardProps | null>(null);
  const [showCommands, setShowCommands] = useState(false);

  const fetchMachineDetails = async () => {
    if (!machineId) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/machines/get/${machineId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to fetch machine details");
      }

      setMachine(data.machine);
    } catch (err: any) {
      setError(err.message || "Failed to fetch machine details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineDetails();
  }, [machineId]);

  return (
    <div className="h-screen flex">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-0 flex flex-col items-center p-6">

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-2xl text-gray-400 animate-pulse">
              Loading machine details...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="text-red-400 bg-red-900/30 border border-red-500/20 px-6 py-4 rounded-lg mb-4">
              {error}
            </div>

            <button
              onClick={fetchMachineDetails}
              className="px-6 py-3 bg-primary hover:bg-red-400 rounded-md cursor-pointer transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && machine && (
        <div className="w-full max-w-2xl pt-6">

            <h1 className="text-4xl font-bold mb-8 text-center">
                Machine Details
            </h1>

            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg space-y-5 flex gap-4 flex-col">

                <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{machine.name}</span>
                </div>

                <div className="flex justify-between">
                <span className="text-gray-400">CPU</span>
                <span className="font-medium">{machine.cpu} cores</span>
                </div>

                <div className="flex justify-between">
                <span className="text-gray-400">GPU</span>
                <span className="font-medium">{machine.gpu}</span>
                </div>

                <div className="flex justify-between">
                <span className="text-gray-400">RAM</span>
                <span className="font-medium">{machine.ram} GB</span>
                </div>

                <div className="flex justify-between">
                <span className="text-gray-400">Storage</span>
                <span className="font-medium">{machine.storage} TB</span>
                </div>

                <div className="flex justify-between border-t border-gray-800 pt-4">
                <span className="text-gray-400">Price / Hour</span>
                <span className="font-semibold text-green-400">
                    $
                    {machine.pricePerHour
                    ? machine.pricePerHour.toFixed(2)
                    : "0.00"}
                </span>
                </div>

            </div>


            <div className="mt-12 flex justify-center">
                <button onClick={() => setShowCommands(true)} className="p-4 m-4  bg-primary hover:bg-primary-hover cursor-pointer rounded-lg font-semibold transition shadow-md text-xl">
                Start Machine
                </button>
            </div>

            </div>
        )}

        {!loading && !error && !machine && (
          <div className="text-gray-400 mt-20">
            Machine not found.
          </div>
        )}

        {machine && (
  <>
    

    {/* Modal */}
    <div className="p-4 mt-6">
      <div className="bg-card border border-card-border rounded-xl p-6">

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Run Your Machine
        </h2>

        <p className="text-gray-400 mb-4 text-center text-xl">
          If container is new → use <strong>run</strong><br />
          If already created → use <strong>start</strong>
        </p>

        <div className="mb-4">
          <p className="text-xl text-gray-400 mb-1">Create & Run:</p>
          <div className="mt-3 flex items-start gap-4 border border-gray-800 rounded-lg p-4">
            <div className="bg-black rounded-md text-sm overflow-x-auto ">
                <code id="run-cmd">
                  {`docker run -it --name ${machine.name} 
                  -e WS_SERVER_URL=${WEBSOCKET_URL} 
                  -e HOST_ID=host-1 host-worker`}
                </code>
            </div>

            <button
                onClick={() => {
                navigator.clipboard.writeText(
                    `docker run -it --name ${machine.name} -e WS_SERVER_URL=${WEBSOCKET_URL}  -e HOST_ID=host-1 host-worker`
                );
                }}
                className="text-sm text-green-400 hover:underline"
            >
                <Copy/>
            </button>
          </div>
          </div>


        <div className="mb-4">
          <p className="text-xl text-gray-400 mb-1">Start Existing:</p>
          <div className="mt-3 flex items-between gap-4 border border-gray-800 rounded-lg p-4">
            <div className="bg-black rounded-md text-sm overflow-x-auto ">
                <code id="start-cmd">
                  {`docker start ${machine.name}`}
                </code>
            </div>

            <button
                onClick={() => {
                navigator.clipboard.writeText(
                    `docker start ${machine.name}`
                );
                }}
                className="mt-2 text-sm text-green-400 hover:underline"
            >
                <Copy/>
            </button>
          </div>
        </div>


          <div className="mt-6 flex justify-center">
          <button
              onClick={() => setShowCommands(false)}
              className="px-4 py-2 bg-secondary cursor-pointer hover:bg-gray-800 rounded-md"
          >
              Close
          </button>
          </div>

          </div>
          </div>
        </>
        )}

      </main>
    </div>
  );
}