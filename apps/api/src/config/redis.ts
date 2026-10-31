import { Redis } from "ioredis";
import { env } from "./env.js";

let _redis: Redis | null = null;
let _redisReady = false;

function createRedisConnection(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck:     false, // required by BullMQ
    family:               4,    // force IPv4 — avoids IPv6 issues on some hosts
    connectTimeout:       10000, // 10s initial connect timeout
    lazyConnect:          true,  // don't connect until first command
    retryStrategy(times: number) {
      if (times >= 10) {
        console.warn("[Redis] Giving up after 10 attempts — email queuing disabled");
        return null; // stop retrying
      }
      const delay = Math.min(100 * 2 ** times, 2000);
      console.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    reconnectOnError(err: Error) {
      return err.message.includes("READONLY");
    },
  });

  client.on("connect",      () => { _redisReady = true;  console.log("[Redis] Connected"); });
  client.on("ready",        () => { _redisReady = true; });
  client.on("error",        (err: Error) => { _redisReady = false; console.error("[Redis] Error:", err.message); });
  client.on("close",        () => { _redisReady = false; console.warn("[Redis] Connection closed"); });
  client.on("reconnecting", () => console.warn("[Redis] Reconnecting…"));
  client.on("end",          () => { _redisReady = false; console.warn("[Redis] Connection ended"); });

  return client;
}

export const redisConnection = createRedisConnection();

/** True only when Redis is connected and ready. */
export function isRedisReady(): boolean {
  return _redisReady;
}

/**
 * Gracefully close the Redis connection.
 * Safe to call even if Redis never connected.
 */
export async function closeRedis() {
  try {
    if (redisConnection.status !== "end") {
      await redisConnection.quit();
    }
    console.log("[Redis] Connection closed gracefully");
  } catch {
    // Non-fatal — force disconnect
    redisConnection.disconnect();
  }
}
