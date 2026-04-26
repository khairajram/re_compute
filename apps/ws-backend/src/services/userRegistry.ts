import { userSockets } from "../state/user.js";
import { WebSocket } from "ws";



export function registerUser(socket:WebSocket , machineId: string) {
    const exist = userSockets.find((x) => x.machineId === machineId);
    if(exist){
        console.log("user already registered with this machine id");
        return;
    }
    userSockets.push({socket , machineId });
    socket.send(JSON.stringify({
        type: "SYSTEM_INFO",
        sub_type : "REGISTER_USER",
        payload: {
            message: "user registered successfully"
        }
    }));
}