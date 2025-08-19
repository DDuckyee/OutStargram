import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// NextAuth 핸들러 생성
const handler = NextAuth(authOptions)

// Next.js App Router에서는 GET과 POST 모두 export해야 함
export { handler as GET, handler as POST }
