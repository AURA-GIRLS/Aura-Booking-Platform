import { createClient } from "redis";
import {config}  from "./index";
    
export const redisClient = createClient({
    username: 'default',
    password: config.redisPassword,
    socket: {
        host: config.redisHost,
        port: config.redisPort,
    }
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export async function connectRedis() {
  console.log("🔗 Connecting to Redis..." + config.redisPassword);
  if (!redisClient.isOpen) 
  {
      await redisClient.connect();
     console.log("✅ Redis connected successfully");
  }
}