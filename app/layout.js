import { Inter } from 'next/font/google'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SessionProvider from "@/components/SessionProvider"
import Header from "@/components/Header"
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MyGram - 나만의 인스타그램',
  description: 'Next.js로 만든 소셜 미디어 플랫폼',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ko">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
