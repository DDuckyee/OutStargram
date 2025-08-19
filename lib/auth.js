import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import { db } from "@/lib/db"

export const authOptions = {
  // Prisma를 사용하여 사용자 정보를 데이터베이스에 저장
  adapter: PrismaAdapter(db),

  // 로그인 방법들 (현재는 GitHub만)
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  // 콜백 함수들 (로그인 과정에서 실행되는 함수들)
  callbacks: {
    // 세션 정보에 사용자 ID 추가
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id, // 데이터베이스의 사용자 ID 추가
      },
    }),
  },

  // 커스텀 페이지 설정
  pages: {
    signIn: '/login', // 로그인이 필요할 때 이동할 페이지
  },
}
