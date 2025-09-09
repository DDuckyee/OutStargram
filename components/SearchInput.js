// components/SearchInput.js
// 실시간 검색 입력 컴포넌트

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  X,
  User,
  Hash,
  Clock,
  TrendingUp,
  Loader2
} from "lucide-react"

export default function SearchInput({
  placeholder = "검색...",
  showResults = true,
  onFocus,
  onBlur
}) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState({
    users: [],
    hashtags: [],
    recent: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  const searchRef = useRef(null)
  const router = useRouter()

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('최근 검색어 로드 오류:', e)
      }
    }
  }, [])

  // 검색 디바운싱 (300ms 지연)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 0) {
        await performSearch(query)
      } else {
        setResults({ users: [], hashtags: [], recent: recentSearches })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, recentSearches])

  // 실제 검색 수행
  const performSearch = async (searchQuery) => {
    setIsLoading(true)
    try {
      console.log("🔍 검색 시작:", searchQuery)

      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setResults({
          users: data.users || [],
          hashtags: data.hashtags || [],
          recent: []
        })
        console.log("✅ 검색 결과:", data)
      } else {
        console.error("검색 오류:", data.error)
      }
    } catch (error) {
      console.error("검색 API 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 검색어 선택 처리
  const handleSelectSearch = (searchTerm, type = 'general') => {
    // 최근 검색어에 추가
    const newSearch = {
      term: searchTerm,
      type: type,
      timestamp: Date.now()
    }

    const updatedRecent = [
      newSearch,
      ...recentSearches.filter(item => item.term !== searchTerm)
    ].slice(0, 10) // 최대 10개까지

    setRecentSearches(updatedRecent)
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))

    // 검색 결과 페이지로 이동
    if (type === 'user') {
      router.push(`/profile/${searchTerm}`)
    } else if (type === 'hashtag') {
      router.push(`/search?hashtag=${encodeURIComponent(searchTerm)}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    }

    setIsOpen(false)
    setQuery("")
  }

  // 최근 검색어 삭제
  const removeRecentSearch = (searchTerm, event) => {
    event.stopPropagation()
    const updated = recentSearches.filter(item => item.term !== searchTerm)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // 포커스 처리
  const handleFocus = () => {
    setIsOpen(true)
    if (query.length === 0) {
      setResults({ users: [], hashtags: [], recent: recentSearches })
    }
    onFocus?.()
  }

  // 블러 처리 (약간의 지연으로 클릭 이벤트 허용)
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false)
      onBlur?.()
    }, 150)
  }

  // 입력 초기화
  const clearQuery = () => {
    setQuery("")
    setResults({ users: [], hashtags: [], recent: recentSearches })
    searchRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-md">
      {/* 검색 입력창 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`w-4 h-4 transition-colors ${
            isOpen ? 'text-blue-500' : 'text-gray-400'
          }`} />
        </div>

        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border-2 rounded-xl transition-all duration-200 focus:outline-none ${
            isOpen
              ? 'border-blue-500 bg-white shadow-lg'
              : 'border-transparent hover:bg-gray-100'
          }`}
        />

        {/* 우측 아이콘들 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}

          {query && !isLoading && (
            <button
              onClick={clearQuery}
              className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">

          {/* 검색 결과가 없을 때 */}
          {query.length > 0 && !isLoading &&
           results.users.length === 0 && results.hashtags.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium mb-1">검색 결과가 없습니다</p>
              <p className="text-xs">다른 키워드로 검색해보세요</p>
            </div>
          )}

          {/* 사용자 검색 결과 */}
          {results.users.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  사용자
                </h4>
              </div>
              <div className="py-1">
                {results.users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectSearch(user.id, 'user')}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={user.image || "/default-avatar.png"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.name.toLowerCase().replace(/\s+/g, '')}
                      </div>
                    </div>
                    <User className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 해시태그 검색 결과 */}
          {results.hashtags.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  해시태그
                </h4>
              </div>
              <div className="py-1">
                {results.hashtags.map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    onClick={() => handleSelectSearch(hashtag.tag, 'hashtag')}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Hash className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">
                        #{hashtag.tag}
                      </div>
                      <div className="text-sm text-gray-500">
                        게시글 {hashtag.count}개
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 최근 검색 결과 */}
          {query.length === 0 && results.recent.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  최근 검색
                </h4>
              </div>
              <div className="py-1">
                {results.recent.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 group"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />

                    <button
                      onClick={() => handleSelectSearch(item.term, item.type)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-900">
                        {item.type === 'hashtag' ? '#' : ''}{item.term}
                      </div>
                    </button>

                    <button
                      onClick={(e) => removeRecentSearch(item.term, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 인기 검색어 (검색어가 없을 때) */}
          {query.length === 0 && results.recent.length === 0 && (
            <div>
              <div className="px-4 py-2 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  인기 검색어
                </h4>
              </div>
              <div className="py-1">
                {['#일상', '#맛집', '#여행', '#카페', '#반려동물'].map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => handleSelectSearch(tag.slice(1), 'hashtag')}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{tag}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
