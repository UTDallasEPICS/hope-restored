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

function getDatasourceUrl() {
  const rawUrl = process.env.DATABASE_URL?.trim()
  if (!rawUrl) return undefined

  if (rawUrl.startsWith('file:./') || rawUrl.startsWith('file:../')) {
    const relativePath = rawUrl.replace(/^file:/, '')
    const absolutePath = resolve(adminRoot, relativePath)
    return `file:${absolutePath}`
  }

  return rawUrl
}

const prismaClientSingleton = () => {
  const datasourceUrl = getDatasourceUrl()
  if (datasourceUrl) {
    process.env.DATABASE_URL = datasourceUrl
    if (process.env.NODE_ENV !== 'production') {
      console.info('[prisma] DATABASE_URL:', datasourceUrl)
    }
  }

  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
