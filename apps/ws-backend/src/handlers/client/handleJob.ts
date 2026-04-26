import { WebSocket } from "ws";
import { hostSockets } from "../../state/hosts.js";

export function handleRunJob(socket: WebSocket, machineId: string , command: string,sessionId: string) {
    console.log("Handling job for machine:", machineId);
    console.log("Command:", command);
    const host = hostSockets.find((x) => x.machineId === machineId);
    if (host) {
        host.socket.send(JSON.stringify({
            type: "RUN_JOB",
            sessionId,
            command,
        }));
    } else {
        socket.send(JSON.stringify({
            type: "HOST_JOB_RESULT",
            status: "offline",
        }));
    }
}

