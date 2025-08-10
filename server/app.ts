import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./config/env";

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

export default app;
