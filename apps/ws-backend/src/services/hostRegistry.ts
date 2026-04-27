import { hostSockets } from "../state/hosts.js";
import { WebSocket } from "ws";
import { prisma } from "@repo/db/client";


export async function registerHost(socket:WebSocket , machineId: string) {
    hostSockets.push({socket , machineId });
    socket.send(JSON.stringify({
        type: "SYSTEM_INFO",
        sub_type : "REGISTER_HOST",
        payload: {
            message: "host registered successfully"
        }
    }));

    try {
      await prisma.hostMachine.update({
        where: { id: machineId },
        data: { isOnline: true }
      });
      console.log(`Updated DB: Machine ${machineId} is online`);
    } catch (e) {
      console.error(`Failed to update DB for machine ${machineId}`, e);
    }
}