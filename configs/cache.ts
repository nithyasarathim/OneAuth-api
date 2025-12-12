import { createClient } from "redis";
import config from "./env";

const redis = createClient({
  url: config.cacheServerUrl,
});

redis.on("error", (err) => {
  console.log("[REDIS CONNECTION ERROR] :", err);
});

const connectCache = async () => {
  try {
    await redis.connect();
    console.log("Redis Connection : SUCCESS");
  } catch (err) {
    console.log("Redis Connection : FAILURE");
    console.log(err);
    process.exit(1);
  }
};

export { redis, connectCache };
