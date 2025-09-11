import { createClient } from "redis";
import {config}  from "./index";
export const redisClient = createClient({
  url: config.redisUri
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export async function connectRedis() {
  if (!redisClient.isOpen) 
  {
      await redisClient.connect();
     console.log("✅ Redis connected successfully");
  }
}