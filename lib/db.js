import { PrismaClient } from '@prisma/client'

// 전역 변수로 Prisma 클라이언트 관리
const globalForPrisma = globalThis

// 개발 환경에서는 기존 클라이언트 재사용, 없으면 새로 생성
export const db = globalForPrisma.prisma || new PrismaClient()

// 개발 환경에서만 전역 변수에 저장 (Hot Reload 시 재사용)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
