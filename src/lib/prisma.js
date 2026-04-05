const { PrismaClient } = require("@prisma/client");

// Singleton pattern to prevent multiple Prisma Client instances in development
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
