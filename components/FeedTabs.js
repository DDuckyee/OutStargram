// components/FeedTabs.js
// 피드 탭 (전체/팔로잉) 컴포넌트

"use client"

import Link from "next/link"
import { Globe, Users } from "lucide-react"

export default function FeedTabs({ currentFeed = 'all' }) {
  const tabs = [
    {
      id: 'all',
      label: '전체',
      icon: Globe,
      href: '/?feed=all',
      description: '모든 사용자의 게시글'
    },
    {
      id: 'following',
      label: '팔로잉',
      icon: Users,
      href: '/?feed=following',
      description: '팔로우한 사용자의 게시글'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentFeed === tab.id

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex-1 px-6 py-4 text-center transition-all duration-200 relative group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="font-medium">{tab.label}</span>
              </div>

              <p className={`text-xs mt-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                {tab.description}
              </p>

              {/* 활성 탭 표시 */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
