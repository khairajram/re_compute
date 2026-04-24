import { hostSockets } from "../state/hosts";
import { WebSocket } from "ws";



export function registerHost(socket:WebSocket , machineId: string) {
    hostSockets.push({socket , machineId });
    socket.send(JSON.stringify({
        type: "SYSTEM_INFO",
        sub_type : "REGISTER_HOST",
        payload: {
            message: "host registered successfully"
        }
    }));
}