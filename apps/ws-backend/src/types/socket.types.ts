import { WebSocket } from "ws";

export enum Roles{
    USER = "USER",
    HOST = "HOST",
    SERVER = "SERVER"
}

export interface SocketType {
    socket: WebSocket;
    machineId: string;
} 
