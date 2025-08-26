import { env } from "./config/env";
import { connectDB } from "./config/db";
import app from "./app";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

async function start() {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.clientUrl, "http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Client can optionally join a specific conversation room
    socket.on("conversation:join", (conversationId: string) => {
      if (typeof conversationId === "string" && conversationId.length > 0) {
        socket.join(conversationId);
      }
    });

    socket.on("disconnect", () => {
      // No-op for now
    });
  });

  // Expose io globally in process for controllers to access without importing socket.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any).io = io;

  httpServer.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
