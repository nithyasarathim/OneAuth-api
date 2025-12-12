import app from "./app.ts";
import config from "./configs/env.ts";
import connectDB from "./configs/database.ts";
import { connectCache } from "./configs/cache.ts";

const startServer = async () => {
  await connectDB();
  await connectCache();
  app.listen(config.port, () => {
    console.log(
      `One Auth Server is running on http://localhost:${config.port}`
    );
  });
};

startServer();
