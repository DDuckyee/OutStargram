"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Camera,
  Home,
  PlusSquare,
  User,
  Search,
  Heart,
  MessageCircle,
  Menu,
  X,
  LogOut
} from "lucide-react"

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 스크롤 감지 (헤더 배경 효과용)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 네비게이션 아이템들 정의
  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "홈",
      active: pathname === "/"
    },
    {
      href: "/create",
      icon: PlusSquare,
      label: "작성",
      active: pathname === "/create"
    },
    {
      href: "/profile",
      icon: User,
      label: "프로필",
      active: pathname === "/profile"
    }
  ]

  const handleSignOut = async () => {
    if (confirm("정말 로그아웃하시겠습니까?")) {
      await signOut({ callbackUrl: "/" })
    }
  }

  return (
    <header className={`
      sticky top-0 z-50 transition-all duration-300
      ${isScrolled ? 'header-blur shadow-sm' : 'bg-white border-b border-gray-100'}
    `}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Camera className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold logo-gradient hidden sm:block">
              MyGram
            </span>
          </Link>

          {/* 검색바 (데스크톱에서만) */}
          {session && (
            <div className="hidden md:flex items-center max-w-xs w-full mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-1">
            {status === "loading" ? (
              // 로딩 상태
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : session ? (
              // 로그인된 상태
              <>
                {/* 네비게이션 아이템들 */}
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${item.active ? 'active' : ''}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="ml-2 text-sm hidden lg:block">
                      {item.label}
                    </span>
                  </Link>
                ))}

                {/* 액션 아이콘들 */}
                <div className="flex items-center space-x-1 ml-4 pl-4 border-l border-gray-200">
                  <button className="icon-btn relative">
                    <Heart className="w-5 h-5" />
                    <span className="notification-badge">2</span>
                  </button>
                  <button className="icon-btn relative">
                    <MessageCircle className="w-5 h-5" />
                    <span className="notification-badge">5</span>
                  </button>
                </div>

                {/* 프로필 & 로그아웃 */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <Link href="/profile" className="flex items-center space-x-2 group">
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="profile-image"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden xl:block transition-colors">
                      {session.user.name}
                    </span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="icon-btn text-gray-500 hover:text-red-600"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              // 로그인되지 않은 상태
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                로그인
              </Link>
            )}
          </nav>

          {/* 모바일 메뉴 버튼 */}
          {session && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden icon-btn"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* 모바일 메뉴 */}
        {session && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2 mobile-menu-enter-active">
            {/* 모바일 검색 */}
            <div className="px-2 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 모바일 네비게이션 */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg mx-2 transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="ml-3 font-medium">{item.label}</span>
              </Link>
            ))}

            {/* 모바일 액션들 */}
            <div className="flex items-center justify-around pt-4 mx-2 border-t border-gray-100">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600">
                <Heart className="w-5 h-5" />
                <span className="text-sm">활동</span>
                <span className="notification-badge">2</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">메시지</span>
                <span className="notification-badge">5</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">로그아웃</span>
              </button>
            </div>

            {/* 모바일 프로필 정보 */}
            <div className="flex items-center space-x-3 px-4 py-3 mx-2 bg-gray-50 rounded-lg">
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{session.user.name}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
