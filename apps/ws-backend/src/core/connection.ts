import { WebSocket } from "ws";
import { disconnectHandler, errorHandler, handleMessage } from "../handlers/index";


export function handleConnection(socket: WebSocket) {
  console.log("New client connected");

  socket.send(JSON.stringify({
    type: "system-connect",
    message: "server connected",
  }));

  socket.on("message", (message) => {
    handleMessage(socket, message);
  });

  socket.on("close", () => {
    disconnectHandler(socket);
  });

  socket.on("error", (err) => {
    errorHandler(socket, err);
  });
}