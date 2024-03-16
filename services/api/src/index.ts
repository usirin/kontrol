import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "http";
import { WebSocketServer } from "ws";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 3000;

const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

const wss = new WebSocketServer({ server: server as Server });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
