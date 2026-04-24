import { WebSocket } from "ws";
import { userSockets } from "../../state/user";


export function handleJobOutput(socket: WebSocket, machineId: string , success: boolean,sessionId: string,output:string) {
    console.log("Handling job for machine:", machineId);
    const user = userSockets.find((x) => x.machineId === machineId);
    if (user) {
        user.socket.send(JSON.stringify({
            type: "HOST_JOB_RESULT",
            sessionId,
            success,
            output,
        }));
    } else {
        socket.send(JSON.stringify({
            type: "HOST_JOB_RESULT",
            status: "offline",
        }));
    }
}