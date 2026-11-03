import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the spec at startup — works in both src/ (dev) and dist/ (prod)
function loadSpec(): Record<string, unknown> {
  // In production, the JSON sits next to the compiled JS (copied by build)
  // In dev (tsx), it sits in src/config/
  const candidates = [
    path.join(__dirname, "swagger.json"),
    path.join(__dirname, "../../src/config/swagger.json"),
  ];

  for (const p of candidates) {
    try {
      return JSON.parse(readFileSync(p, "utf-8")) as Record<string, unknown>;
    } catch {
      // try next
    }
  }

  console.warn("[Swagger] Could not load swagger.json — docs disabled");
  return {};
}

export const swaggerSpec = loadSpec();
