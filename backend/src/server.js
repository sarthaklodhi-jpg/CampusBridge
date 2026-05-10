import app from "./app.js";
import { createServer } from "http";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { configureSocketServer } from "./realtime/socket.js";

const startServer = async () => {
  try {
    await connectDB();
    const httpServer = createServer(app);
    configureSocketServer(httpServer);
    httpServer.listen(env.port, () => {
      console.log(`API and realtime server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
