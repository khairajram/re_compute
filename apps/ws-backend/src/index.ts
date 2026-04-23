import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

interface UserType {
  socket: WebSocket;
  id: number;
  name: string;
}

let allSockets: UserType[] = [];

let hostSockets: UserType;
let userSockets: UserType;

wss.on("connection", function (socket) {
  console.log("New client connected");

  socket.send(JSON.stringify({
    type: "system-connect",
    message: "server connected",
  }));

  socket.on("message", (message) => {
    try {

      const parsedMessage = JSON.parse(message.toString());
      console.log("Received message:", parsedMessage);

      if (parsedMessage.type === "REGISTER_USER") {
        const { id, name } = parsedMessage;
        userSockets = { socket, id : parsedMessage.id, name : parsedMessage.name };
        
        console.log(`user '${name}' joined room ${id}`);
      }

      if (parsedMessage.type === "REGISTER_HOST") {
        console.log("Registering host with message:", parsedMessage);
        const { id, name } = parsedMessage;
        hostSockets = { socket, id, name };

        console.log(`Host '${name}' joined room ${id}`);
      }

      // if (!userSockets?.socket) {
      //   console.error("❌ No user connected");
      //   return;
      // }

      // if (!hostSockets?.socket) {
      //   console.error("❌ No host connected");
      //   return;
      // }
      
     

      

      if (parsedMessage.type === "JOB_RESULT" && parsedMessage.sender === "HOST") {

        console.log("Forwarding job result to user:", parsedMessage);

        const { output } = parsedMessage;
          const outgoing = JSON.stringify({
            type: "JOB_RESULT",
            output,
          });

          userSockets.socket.send(outgoing);
      }

      if (parsedMessage.type === "JOB_QUERY" && parsedMessage.sender === "USER") {

        console.log("Forwarding job query to host:", parsedMessage);

        const { cmd, sessionId } = parsedMessage;
          const outgoing = JSON.stringify({
            type: "RUN_JOB",
            sessionId,
            command: cmd
          });

          hostSockets.socket.send(outgoing);
      }
    } catch (err) {
      console.error("Failed to handle message:", err);
    }
  });

  socket.on("close", () => {
    const sender = allSockets.find((x) => x.socket === socket);
    allSockets = allSockets.filter((user) => user.socket !== socket);

    // const usersInRoom = allSockets.filter(user => user.id === sender?.id);
    // const userCount = usersInRoom.length;

    // const roomUpdate = JSON.stringify({
    //   type: "system",
    //   users: userCount,
    // });

    // usersInRoom.forEach(user => user.socket.send(roomUpdate));
    // console.log("User disconnected");
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});


server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});