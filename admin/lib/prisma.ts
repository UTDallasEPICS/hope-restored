import { PrismaClient } from '@prisma/client'
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const envCandidates = [resolve(process.cwd(), '.env'), resolve(process.cwd(), 'admin/.env')]
const resolvedEnvPath = envCandidates.find((path) => existsSync(path))

if (resolvedEnvPath) {
  loadEnv({ path: resolvedEnvPath })
} else {
  loadEnv()
}

const adminRoot = resolvedEnvPath ? dirname(resolvedEnvPath) : process.cwd()


const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
