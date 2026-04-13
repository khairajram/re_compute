import WebSocket from "ws";
import dotenv from "dotenv";

dotenv.config();

const ws = new WebSocket(process.env.WS_SERVER_URL!);

ws.on("open", () => {
  console.log("✅ Connected to WS server");

  // Register host
  ws.send(
    JSON.stringify({
      type: "REGISTER_HOST",
      hostId: process.env.HOST_ID
    })
  );
});

ws.on("message", async (data) => {
  const message = JSON.parse(data.toString());

  console.log("📩 Received:", message);

  if (message.type === "RUN_JOB") {
    const result = await runCommand(message.command);

    ws.send(
      JSON.stringify({
        type: "JOB_RESULT",
        jobId: message.jobId,
        output: result
      })
    );
  }
});