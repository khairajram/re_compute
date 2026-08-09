import { handleCheckStatus,handleFinalPong,handlePong } from "./host/checkStatus.js";
import { registerUser } from "../services/userRegistry.js";
import { registerHost } from "../services/hostRegistry.js";
import { WebSocket } from "ws";
import { handleRunJob } from "./client/handleJob.js";
import { handleJobOutput } from "./host/jobResult.js";
import { hostSockets } from "../state/hosts.js";
import { userSockets } from "../state/user.js";
import { prisma } from "@repo/db/client";

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
      const { machineId,sessionId,success , output, cwd} = parsedMessage;
      return handleJobOutput(socket, machineId , sessionId,success,output,cwd);
    }

    if (parsedMessage.type === "CONFIGURATION_RESULT"){
      const { machineId,success, output} = parsedMessage;
      return handleFinalPong(socket, machineId ,success,output);
    }


    if (parsedMessage.type === "hii"){
      socket.send(JSON.stringify({
        type: "hello",
        message: "hello from server",
      }));
      return;
    }

    // Generic bidirectional router
    if (parsedMessage.machineId) {
      const isUser = userSockets.some((u) => u.socket === socket);
      if (isUser) {
        // Forward from user to host
        const host = hostSockets.find((h) => h.machineId === parsedMessage.machineId);
        if (host) {
          host.socket.send(message.toString());
        }
      } else {
        // Forward from host to user
        const user = userSockets.find((u) => u.machineId === parsedMessage.machineId);
        if (user) {
          user.socket.send(message.toString());
        }
      }
    }

  } catch (err) {
    console.error("Failed to handle message:", err);
  }
}


export async function disconnectHandler(socket: WebSocket) {

  const hostIndex = hostSockets.findIndex((host) => host.socket === socket);
  const userIndex = userSockets.findIndex((user) => user.socket === socket);

  if (hostIndex !== -1) {
    const isHost = hostSockets[hostIndex];
    hostSockets.splice(hostIndex, 1);
    if (isHost) {
      console.log(`Host disconnected: ${isHost.machineId}`);
      try {
        await prisma.hostMachine.update({
          where: { id: isHost.machineId },
          data: { isOnline: false }
        });
        console.log(`Updated DB: Machine ${isHost.machineId} is offline`);
      } catch (e) {
        console.error(`Failed to update DB for machine ${isHost.machineId}`, e);
      }
    }
  }

  if (userIndex !== -1) {
    const isUser = userSockets[userIndex];
    userSockets.splice(userIndex, 1);
    if (isUser) {
      console.log(`User disconnected: ${isUser.machineId}`);
    }
  }

  console.log("Client disconnected");
}

export function errorHandler(socket: WebSocket, error: Error) {

  console.error("Socket error:", error);
}