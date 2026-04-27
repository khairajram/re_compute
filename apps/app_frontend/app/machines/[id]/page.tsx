"use client";

import { BASE_URL } from "@/app/config";
import { MachineCardProps } from "@/components/ui/machine";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WEBSOCKET_URL } from "../../config";
import { Copy } from "lucide-react";
import { useSocket } from "@/app/providers/SocketProvider";

export default function MachinePage() {
  const params = useParams();
  const socket = useSocket();

  // useEffect(() => {
  //   if (!socket) return;

  //   // socket.onmessage = (event) => {
  //   //   console.log("from socket", event.data);
  //   // };
  //   // socket.send(JSON.stringify({ type: "hii" }));
  // }, [socket]);

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
    <div className="h-screen flex min-w-[380px]">
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-[380px] p-6 overflow-y-auto">
              <MachineInfo machine={machine} />
              <Stats machine={machine} />
              <GetStarted machine={machine}/>
              <MachineStatus machine={machine}/>
            </div>
          </>
          
        )}

        {!loading && !error && !machine && (
          <div className="text-gray-400 mt-20">
            Machine not found.
          </div>
        )}

      </main>
    </div>
  );
}


function MachineStatus({ machine }: { machine: MachineCardProps }) {
  const socket = useSocket();

  const [status, setStatus] = useState<"online" | "offline" | "unknown">("unknown");
  const [remainingTime, setRemainingTime] = useState("--");

  const checkStatus = () => {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: "CLIENT_CHECK_STATUS",
        machineId: machine.id,
      })
    );
  };

  useEffect(() => {
    if (!socket) return;

    checkStatus();

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "SERVER_PONG" && data.machineId === machine.id) {
        setStatus(data.status);

        // mock for now (replace with real backend value)
        setRemainingTime(data.remainingTime || "25 min");
      }
    };

    socket.addEventListener("message", handler);

    return () => {
      socket.removeEventListener("message", handler);
    };
  }, [socket, machine.id]);

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg space-y-5">
      
      {/* 🔝 Status Header */}
      <h2 className="text-2xl font-semibold text-center">
        Machine Status
      </h2>

      {/* 🟢 ONLINE UI */}
      {status === "online" && (
        <>
          <div className="text-center text-green-500 font-semibold text-lg">
            🟢 Machine is Online
          </div>

          {/* 4 boxes grid */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-muted p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm">Total Time</p>
              <p className="font-medium">{remainingTime}</p>
            </div>

            <div className="bg-muted p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm">Remaining</p>
              <p className="font-medium">{remainingTime}</p>
            </div>

            <div className="bg-muted p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm">In Use</p>
              <p className="font-medium">Ideal</p>
            </div>

            <div className="bg-muted p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm">Session Started at</p>
              <p className="font-medium">--</p>
            </div>
          </div>
        </>
      )}

      {/* 🔴 OFFLINE UI */}
      {status === "offline" && (
        <div className="text-center space-y-4">
          <p className="text-red-500 font-semibold text-lg">
            🔴 Machine is Offline
          </p>

          <button
            onClick={checkStatus}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90"
          >
            Check Again
          </button>
        </div>
      )}

      {/* ⚪ UNKNOWN / LOADING */}
      {status === "unknown" && (
        <div className="text-center text-gray-400">
          Checking machine status...
        </div>
      )}
    </div>
  );
}


function Stats({ machine }: { machine: MachineCardProps }) {
  // mock data (replace with real values later)
  const stats = [
    { label: "Total Hours", value: "120 hrs" },
    { label: "Total Earnings", value: "₹15,000" },
    { label: "Total Sessions", value: "320" },
    { label: "Avg Session Time", value: "25 min" },
  ];

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg space-y-5">
      
      <h2 className="text-2xl font-semibold text-center">
        Stats
      </h2>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-muted rounded-xl p-4 text-center hover:scale-105 transition"
          >
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-lg font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
}


function GetStarted({ machine }: { machine: MachineCardProps }) {
  const runCommand = `docker run -it --name ${machine.name} -e WS_SERVER_URL=${WEBSOCKET_URL} -e MACHINE_ID=${machine.id} host-worker`;
  const startCommand = `docker start ${machine.name}`;

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg space-y-5 ">
      
      <h2 className="text-3xl font-semibold text-center ">
        Run Your Machine
      </h2>


      <div className="mt-10">
        <p className="text-xl text-gray-400 mb-1">Create & Run:</p>
        <div className="mt-3 flex justify-between items-start gap-4 border border-gray-800 rounded-lg p-4">
          
          <div className="bg-black rounded-md text-sm overflow-x-auto">
            <code>{runCommand}</code>
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(runCommand)}
            className="text-sm text-green-400 hover:underline self-start"
          >
            <Copy />
          </button>

        </div>
      </div>


      <div>
        <p className="text-xl text-gray-400 mb-1 mt-6">Start Existing:</p>
        <div className="mt-3 flex justify-between items-start gap-4 border border-gray-800 rounded-lg p-4">
          
          <div className="bg-black rounded-md text-sm overflow-x-auto">
            <code>{startCommand}</code>
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(startCommand)}
            className="text-sm text-green-400 hover:underline self-start"
          >
            <Copy />
          </button>

        </div>
      </div>

    </div>
  );
}

export function MachineInfo({machine}: {machine: MachineCardProps}){
  return(
    <>
      <div className="w-full max-w-2xl ">

        

        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-lg space-y-5 flex gap-4 flex-col">

          <div>
            <h1 className="text-3xl font-bold mb-6 text-center">
              Machine Details
            </h1>
          </div>

            <div className="flex justify-between">
            <span className="text-gray-400">Machine Id</span>
            <span className="font-medium">{machine.id}</span>
            </div>

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
        </div>
    </>
  )
}