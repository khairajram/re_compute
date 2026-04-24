import { handleCheckStatus,handlePong } from "./host/checkStatus";
import { registerUser } from "../services/userRegistry";
import { registerHost } from "../services/hostRegistry";
import { WebSocket } from "ws";
import { handleRunJob } from "./client/handleJob";
import { handleJobOutput } from "./host/jobResult";

export function handleMessage(socket: WebSocket, message: any) {
  try {
    const parsedMessage = JSON.parse(message.toString());
    console.log("Received message:", parsedMessage);

    if (parsedMessage.type === "REGISTER_USER"){
      console.log("Registering user with message:", parsedMessage);
      const { machineId } = parsedMessage;
      registerUser(socket , machineId);
    }

    if (parsedMessage.type === "REGISTER_HOST"){
      console.log("Registering host with message:", parsedMessage);
      const { machineId } = parsedMessage;
      registerHost(socket , machineId);
    }

    if (parsedMessage.type === "CLIENT_CHECK_STATUS") {
      const { machineId } = parsedMessage;
      return handleCheckStatus(socket, machineId);
    }

    if (parsedMessage.type === "HOST_PONG") {
      const { machineId } = parsedMessage;
      return handlePong(socket, machineId);
    }

    if (parsedMessage.type === "CLIENT_JOB_QUERY") {
      const { machineId,command,sessionId } = parsedMessage;
      return handleRunJob(socket, machineId , command , sessionId);
    }

    if (parsedMessage.type === "HOST_JOB_RESULT"){
      const { machineId,sessionId,success , output} = parsedMessage;
      return handleJobOutput(socket, machineId , sessionId,success,output);
    }
    if (parsedMessage.type === "hii"){
      socket.send(JSON.stringify({
        type: "hello",
        message: "hello from server",
      }));
    }

  } catch (err) {
    console.error("Failed to handle message:", err);
  }
}


export function disconnectHandler(socket: WebSocket) {

  console.log("Client disconnected");
}

export function errorHandler(socket: WebSocket, error: Error) {

  console.error("Socket error:", error);
}