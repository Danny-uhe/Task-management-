import { Redis } from "ioredis";
import { env } from "./env.js";

/**
 * Shared Redis connection used by BullMQ queues and workers.
 *
 * BullMQ requires `maxRetriesPerRequest: null` on the connection
 * it uses for workers — otherwise it times out on blocking commands.
 */
export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck:     false, // required by BullMQ
  family: 4, // force IPv4 — some hosts (e.g. Render) reset IPv6 connections to Upstash
  retryStrategy(times: number) {
    // Exponential backoff: 50ms, 100ms, 200ms … capped at 2s
    const delay = Math.min(50 * 2 ** times, 2000);
    console.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
  reconnectOnError(err: Error) {
    // Reconnect on READONLY errors (happens on Redis failover)
    return err.message.includes("READONLY");
  },
});

redisConnection.on("connect",      () => console.log("[Redis] Connected"));
redisConnection.on("error",        (err: Error) => console.error("[Redis] Error:", err.message));
redisConnection.on("close",        () => console.warn("[Redis] Connection closed"));
redisConnection.on("reconnecting", () => console.warn("[Redis] Reconnecting…"));

/**
 * Gracefully close the Redis connection on process exit.
 */
export async function closeRedis() {
  await redisConnection.quit();
  console.log("[Redis] Connection closed gracefully");
}

