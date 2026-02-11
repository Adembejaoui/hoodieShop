import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = global as any;

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  
  const adapter = new PrismaPg({
    connectionString,
  })
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

// In development, always reuse the same client to avoid connection pool exhaustion
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

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

/**
 * Execute a database query with retry logic
 * Useful for handling transient connection errors
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        // Check if error is connection-related
        const isConnectionError = 
          lastError.message.includes('connection') ||
          lastError.message.includes('ECONNREFUSED') ||
          lastError.message.includes('MaxClients');
        
        if (isConnectionError) {
          console.warn(`Database connection attempt ${attempt} failed, retrying in ${delayMs}ms...`);
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
