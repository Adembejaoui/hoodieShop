import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  return new PrismaClient({
    adapter,
  })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Always create new client in development to pick up schema changes
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = createPrismaClient()
}

export default prisma