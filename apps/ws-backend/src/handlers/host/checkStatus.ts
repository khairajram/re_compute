import { hostSockets } from "../../state/hosts.js";
import { pendingStatusChecks } from "../../state/pandingRequests.js";
import { WebSocket } from "ws";
import { prisma } from "@repo/db/client";


export function handleCheckStatus(socket: WebSocket, machineId: string) {
  console.log("req for check status",machineId)
  const exist = hostSockets.find((x) => x.machineId === machineId);
  if(exist){
    console.log("host already exists");
  }
  if (!exist) {
    return socket.send(JSON.stringify({
      type : "SERVER_PONG",
      machineId : machineId,
      status: "offline",
    }));
  }

  pendingStatusChecks.set(machineId, socket);

  const host = hostSockets.find((x) => x.machineId === machineId);
  if (host) {
    host.socket.send(JSON.stringify({
      type: "SERVER_PING"
    }));
  } else {
    socket.send(JSON.stringify({
      type : "SERVER_PONG",
      machineId : machineId,
      status: "offline",
    }));  
  }
}

export function handlePong(socket: WebSocket, machineId: string) {

  socket.send(JSON.stringify({
      type: "CHECK_CONFIGURATION",
      command : "cat /sys/fs/cgroup/cpu.max && cat /sys/fs/cgroup/memory.max",
  }));
}

export async function handleFinalPong(socket: WebSocket, machineId: string,success:boolean,output:any) {


  const requester = pendingStatusChecks.get(machineId);
  if(requester && success){

    const [cpuLine, memoryLine] = output.trim().split("\n");

    const [quota, period] = cpuLine.split(" ").map(Number);

    const formatted = {
      cpu: quota / period,
      memory: {
        RAM: Number(memoryLine) / (1024 * 1024),
      },
    };

    const machineConfig = await prisma.hostMachine.findFirst({
      where : {
        id : machineId
      }
    })

    if(machineConfig){
      if(machineConfig.cpu == formatted.cpu && machineConfig.ram == formatted.memory.RAM){
        const res = await prisma?.hostMachine.update({
          where: {
            id: machineId
          },
          data: {
            isOnline: true,
          },
        });
      }

      requester.send(JSON.stringify({
        type: "SERVER_PONG",
        machineId: machineId,
        status: "online",
      }));

      pendingStatusChecks.delete(machineId);
      
    }
    return;
  }
  if (requester && !success){
    requester.send(JSON.stringify({
      type: "SERVER_PONG",
      machineId: machineId,
      status: "online",
    }));

    pendingStatusChecks.delete(machineId);
  }
}