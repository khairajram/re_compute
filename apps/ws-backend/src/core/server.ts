import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "./connection.js";

export function startWebSocketServer() {
  const app = express();
  const port = process.env.PORT || 8080;

  const server = http.createServer(app);

  const wss = new WebSocketServer({ server });

  wss.on("connection", handleConnection);

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}