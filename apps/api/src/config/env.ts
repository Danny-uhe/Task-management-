import dotenv from "dotenv";
import { cleanEnv, port, str } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    default: "development",
    choices: ["development", "production", "test"],
  }),

  PORT: port({
    default: 5000,
  }),

  DATABASE_URL: str(),

  JWT_ACCESS_SECRET: str(),

  JWT_REFRESH_SECRET: str(),

  REDIS_URL: str(),

  // ── Email (SMTP) ──────────────────────────────────────────────────────────
  SMTP_HOST: str(),
  SMTP_PORT: port({ default: 587 }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  SMTP_FROM: str(),

  FRONTEND_URL: str({
    default: "http://localhost:5173",
  }),
});