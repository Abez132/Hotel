import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

/**
 * Wraps a Prisma operation with automatic retry on connection errors.
 * Retries up to `maxRetries` times with exponential backoff.
 *
 * Usage:
 *   const result = await withRetry(() => prisma.entry.findMany());
 *
 * @param {() => Promise<T>} operation
 * @param {number} maxRetries
 * @returns {Promise<T>}
 */
export async function withRetry(operation, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isConnectionError =
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        error instanceof Prisma.PrismaClientInitializationError ||
        (error instanceof Error &&
          (error.message.includes("connection") ||
            error.message.includes("ECONNREFUSED") ||
            error.message.includes("timeout")));

      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 200ms, 400ms, 800ms…
      const delay = 200 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
