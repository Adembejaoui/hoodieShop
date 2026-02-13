import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = global as any;

const createPrismaClient = () => {
  // Prisma 7: Use accelerateUrl for Prisma Accelerate connection
  // The DATABASE_URL should be the Accelerate URL (prisma+postgres://...)
  return new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Use singleton pattern to prevent multiple instances
const prisma = globalForPrisma.prisma ?? createPrismaClient()

// In development, always reuse the same client to avoid connection pool exhaustion
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

/**
 * Retry helper for handling transient database connection errors
 * Implements exponential backoff for Prisma connection pool exhaustion
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 500
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Calculate exponential backoff
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      
      if (attempt < maxRetries) {
        // Check if error is connection-related
        // Includes Prisma Accelerate specific error codes
        const isConnectionError = 
          lastError.message.includes('connection') ||
          lastError.message.includes('ECONNREFUSED') ||
          lastError.message.includes('MaxClients') ||
          lastError.message.includes('pool') ||
          lastError.message.includes('ENOENT') ||
          lastError.message.includes('temporarily unavailable') ||
          lastError.message.includes('P1001') ||  // Can't reach database server
          lastError.message.includes('P1002') ||  // Database server is busy
          lastError.message.includes('P1003') ||  // Database unreachable
          lastError.message.includes('P1008') ||  // Operations timed out
          lastError.message.includes('P1017') ||  // Server has closed the connection
          lastError.message.includes('P2024');    // Timed out fetching a connection from pool
        
        if (isConnectionError) {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Database connection attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms...`);
          }
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          // Non-connection errors should not be retried
          throw lastError;
        }
      }
    }
  }
  
  throw lastError;
}

/**
 * Database Connection Health Check
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
