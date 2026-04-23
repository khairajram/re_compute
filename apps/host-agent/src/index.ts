import WebSocket from "ws";

import dotenv from "dotenv";
import { runCommand } from "./executor.js";

dotenv.config();

const value = process.env["WS_SERVER_URL"];


const ws = new WebSocket(process.env.WS_SERVER_URL!);

ws.on("open", () => {
  console.log("✅ Connected to WS server");

  // Register host
  ws.send(
    JSON.stringify({
      type: "REGISTER_HOST",
      id: 1,
      name : "Host 1"
    })
  );
});

ws.on("error", (err) => {
  console.error("❌ Connection failed:", err.message);
});

ws.on("message", async (data) => {
  const message = JSON.parse(data.toString());

  console.log("📩 Received:", message);

  if (message.type === "RUN_JOB") {
    console.log("job Received:", message);
    const result = await runCommand(message.command);

    console.log("Command output:", result);

    

    ws.send(
      JSON.stringify({
        type: "JOB_RESULT",
        sender: "HOST",
        output: result
      })
    );
  }
});