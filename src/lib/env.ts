const WEAK_PINS = new Set(["1234", "0000", "1111"]);

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const pin = process.env.OWNER_PIN;
  const secret = process.env.SESSION_SECRET || "";

  if (!pin || WEAK_PINS.has(pin)) {
    console.error("OWNER_PIN must be set to a strong PIN in production.");
  }
  if (secret.length < 32) {
    console.error("SESSION_SECRET must be at least 32 characters in production.");
  }
  if (!process.env.DATABASE_URL?.startsWith("postgres")) {
    console.error("DATABASE_URL must be a PostgreSQL connection string in production.");
  }
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
