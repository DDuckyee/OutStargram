// components/MobileSearch.js
// 모바일 전용 검색 페이지

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SearchInput from "./SearchInput"
import { ArrowLeft } from "lucide-react"

export default function MobileSearch({ onClose }) {
  const router = useRouter()

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      {/* 헤더 */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex-1">
          <SearchInput
            placeholder="검색..."
            showResults={true}
            autoFocus={true}
          />
        </div>
      </div>

      {/* 검색 결과는 SearchInput 컴포넌트에서 처리됨 */}
      <div className="p-4">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">검색어를 입력하면 실시간으로 결과가 표시됩니다</p>
        </div>
      </div>
    </div>
  )
}
