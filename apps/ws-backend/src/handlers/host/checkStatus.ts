import { hostSockets } from "../../state/hosts";
import { pendingStatusChecks } from "../../state/pandingRequests";
import { WebSocket } from "ws";

export function handleCheckStatus(socket: WebSocket, machineId: string) {
  pendingStatusChecks.set(machineId, socket);

  const host = hostSockets.find((x) => x.machineId === machineId);
  if (host) {
    host.socket.send(JSON.stringify({
      type: "SERVER_PING",
      machineId: machineId
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
  const requester = pendingStatusChecks.get(machineId);
  if(requester){
    requester.send(JSON.stringify({
      type: "SERVER_PONG",
      machineId: machineId,
      status: "online",
    }));

    pendingStatusChecks.delete(machineId);
  }
}