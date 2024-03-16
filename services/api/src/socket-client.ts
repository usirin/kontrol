import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3000/)");

ws.on("error", console.error);

ws.on("open", function open() {
  ws.send("something " + Date.now());
});

ws.on("message", function message(data) {
  console.log("received: %s", data);
});
