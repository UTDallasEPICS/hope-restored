import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../generated/prisma/client'

const envCandidates = [resolve(process.cwd(), '.env'), resolve(process.cwd(), 'admin/.env')]
const resolvedEnvPath = envCandidates.find((path) => existsSync(path))

if (resolvedEnvPath) {
  loadEnv({ path: resolvedEnvPath })
} else {
  loadEnv()
}

const prismaClientSingleton = () => {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  })
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
