import { WebSocket } from "ws";
import { userSockets } from "../../state/user.js";


export function handleJobOutput(socket: WebSocket, machineId: string , success: boolean,sessionId: string,output:string) {
    const user = userSockets.find((x) => x.machineId === machineId);
    if (user) {
        user.socket.send(JSON.stringify({
            type: "JOB_RESULT",
            sessionId,
            success,
            output,
        }));
    } else {
        socket.send(JSON.stringify({
            type: "JOB_RESULT",
            status: "offline",
        }));
    }
}