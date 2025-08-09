import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import pino from "pino";
import pinoHttp from "pino-http";
import socketHandler from "./socket.js";

dotenv.config();
const logger = pino();

const app = express();

// CORS middleware should be placed before any other middleware/routes
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:3005",
      "https://quick-chat-tawny.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  })
);

// Handle preflight requests for all routes
app.options("*", cors());

app.use(express.json());

app.use(
  pinoHttp({
    logger,
    customLogLevel: (res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        id: req.id,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} → ${res.statusCode}`,
    customErrorMessage: (req, res, err) =>
      `❌ ${req.method} ${req.url} → ${res.statusCode} — ${err.message}`,
  })
);

app.use("/api/hello", (req, res) => {
  res.send("Hello");
});
app.use("/uploads/recordings", express.static("uploads/recordings"));
app.use("/uploads/images", express.static("uploads/images"));

app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server started running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "https://quick-chat-tawny.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

socketHandler(io);
