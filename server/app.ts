import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import conversationRoutes from "./routes/conversation.route";
import messageRoutes from "./routes/message.route";

const logger = pino();
const app = express();
const allowedClientUrls = [env.clientUrl, "http://localhost:3000"];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: allowedClientUrls,
  })
);

app.use(
  pinoHttp({
    logger,
  })
);

app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

export default app;
