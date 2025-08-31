import "dotenv/config";

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGO_URI ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET ?? "your-super-secret-jwt-key",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "your-super-secret-refresh-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
};
