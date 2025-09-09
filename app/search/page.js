// app/search/page.js
// 검색 결과를 표시하는 페이지

import { Suspense } from 'react'
import { db } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  User,
  Hash,
  Grid3X3,
  Heart,
  MessageCircle,
  ArrowLeft
} from 'lucide-react'

// 검색 결과 컴포넌트
async function SearchResults({ searchParams }) {
  const resolvedSearchParams = await searchParams  // 🆕 await 추가
  const query = searchParams.q || ''
  const hashtag = searchParams.hashtag || ''
  const type = searchParams.type || 'all'

  console.log("🔍 검색 페이지:", { query, hashtag, type })

  let users = []
  let posts = []
  let searchTerm = query || hashtag

  if (!searchTerm) {
    return (
      <div className="text-center py-16">
        <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          검색어를 입력하세요
        </h2>
        <p className="text-gray-500">
          사용자나 해시태그를 검색해보세요
        </p>
      </div>
    )
  }

  try {
    // 사용자 검색
    if (type === 'all' || type === 'users') {
      users = await db.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          _count: {
            select: {
              posts: true
            }
          }
        },
        take: 20
      })
    }

    // 해시태그 또는 일반 검색으로 게시글 검색
    if (type === 'all' || type === 'posts') {
      const searchCondition = hashtag
        ? {
            caption: {
              contains: `#${hashtag}`,
              mode: 'insensitive'
            }
          }
        : {
            OR: [
              {
                caption: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            ]
          }

      posts = await db.post.findMany({
        where: searchCondition,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      })
    }

  } catch (error) {
    console.error("검색 오류:", error)
    return (
      <div className="text-center py-16">
        <div className="text-red-500 text-xl mb-4">검색 중 오류가 발생했습니다</div>
        <p className="text-gray-600">잠시 후 다시 시도해주세요</p>
      </div>
    )
  }

  const totalResults = users.length + posts.length

  return (
    <div className="space-y-8">
      {/* 검색 결과 헤더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {hashtag ? `#${hashtag}` : `"${searchTerm}"`} 검색 결과
            </h1>
            <p className="text-gray-500">
              총 {totalResults}개의 결과를 찾았습니다
            </p>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Link
            href={`/search?${hashtag ? `hashtag=${hashtag}` : `q=${query}`}&type=all`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            전체
          </Link>
          <Link
            href={`/search?${hashtag ? `hashtag=${hashtag}` : `q=${query}`}&type=users`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'users'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            사용자 ({users.length})
          </Link>
          <Link
            href={`/search?${hashtag ? `hashtag=${hashtag}` : `q=${query}`}&type=posts`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'posts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            게시글 ({posts.length})
          </Link>
        </div>
      </div>

      {/* 사용자 검색 결과 */}
      {users.length > 0 && (type === 'all' || type === 'users') && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>사용자</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {user.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      @{user.name.toLowerCase().replace(/\s+/g, '')}
                    </p>
                    {user.bio && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      게시글 {user._count.posts}개
                    </p>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    팔로우
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 게시글 검색 결과 */}
      {posts.length > 0 && (type === 'all' || type === 'posts') && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5" />
              <span>게시글</span>
            </h2>
          </div>

          {/* 게시글 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square group cursor-pointer"
              >
                <Image
                  src={post.imageUrl}
                  alt={post.caption || "게시글 이미지"}
                  fill
                  className="object-cover rounded-lg"
                />

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-6 h-6" />
                      <span className="font-semibold">
                        {post._count.likes}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-semibold">
                        {post._count.comments}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 작성자 정보 */}
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium">
                      {post.author.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {totalResults === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            {hashtag
              ? `"#${hashtag}" 해시태그를 포함한 게시글이 없습니다`
              : `"${searchTerm}"에 대한 검색 결과가 없습니다`
            }
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• 검색어의 철자를 확인해보세요</p>
            <p>• 더 간단한 키워드로 검색해보세요</p>
            <p>• 다른 키워드로 시도해보세요</p>
          </div>
        </div>
      )}
    </div>
  )
}


export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams  // 🆕 await 추가
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <SearchResults searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  )
}