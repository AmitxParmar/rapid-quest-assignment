import { env } from "./config/env";
import { connectDB } from "./config/db";
import app from "./app";

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
