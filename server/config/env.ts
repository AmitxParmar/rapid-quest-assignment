import "dotenv/config";

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGO_URI ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
};
