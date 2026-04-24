import { userSockets } from "../state/user";
import { WebSocket } from "ws";



export function registerUser(socket:WebSocket , machineId: string) {
    userSockets.push({socket , machineId });
    socket.send(JSON.stringify({
        type: "SYSTEM_INFO",
        sub_type : "REGISTER_USER",
        payload: {
            message: "user registered successfully"
        }
    }));
}