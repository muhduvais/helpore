import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 5000 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    ws.send("Hello from server");
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on http://localhost:5000");