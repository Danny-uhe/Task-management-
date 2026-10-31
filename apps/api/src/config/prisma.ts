import { PrismaClient } from "@prisma/client";

// ── Neon-resilient Prisma client ───────────────────────────────────────────
// Prisma 6 removed $use middleware. We use a thin async wrapper instead
// that is applied around every service call via the exported `db` proxy.

const RETRYABLE = [
  "Can't reach database",
  "connection pool",
  "ECONNRESET",
  "ECONNREFUSED",
  "Timed out",
  "Connection refused",
  "socket hang up",
];

function isRetryable(err: unknown): boolean {
  const msg = (err as Error)?.message ?? "";
  return RETRYABLE.some((s) => msg.includes(s));
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 4): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (isRetryable(err) && attempt < retries) {
        const delay = attempt * 1500; // 1.5 → 3 → 4.5 s
        console.warn(
          `[Prisma] DB unreachable (attempt ${attempt}/${retries}), retrying in ${delay}ms…`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("DB retry limit exceeded");
}

// ── Raw client ─────────────────────────────────────────────────────────────
const _prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// ── Proxy: wraps every property access so async methods auto-retry ─────────
// This gives us transparent retry on ALL prisma.xxx.yyy() calls without
// touching any service file.
function makeRetryProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop) {
      const value = (obj as Record<string | symbol, unknown>)[prop as string];

      // Delegate accessor (e.g. prisma.user) → wrap the returned model object
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof prop === "string" &&
        !prop.startsWith("$") &&
        !prop.startsWith("_")
      ) {
        return makeRetryProxy(value as object);
      }

      // Method call → wrap in withRetry
      if (typeof value === "function") {
        return (...args: unknown[]) => {
          const result = (value as (...a: unknown[]) => unknown).apply(obj, args);
          // Only retry Promise-returning methods
          if (result instanceof Promise) {
            return withRetry(() => (value as (...a: unknown[]) => Promise<unknown>).apply(obj, args));
          }
          return result;
        };
      }

      return value;
    },
  });
}

export const prisma = makeRetryProxy(_prisma) as typeof _prisma;

// ── Keep-alive ping ────────────────────────────────────────────────────────
// Runs every 4 minutes to prevent Neon free tier from sleeping.
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

export function startKeepAlive() {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(async () => {
    try {
      await _prisma.$queryRaw`SELECT 1`;
    } catch {
      // Non-fatal — next real request will retry
    }
  }, 4 * 60 * 1000);
  keepAliveTimer.unref(); // don't block process exit
}

export function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}
