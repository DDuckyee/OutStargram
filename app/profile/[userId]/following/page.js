// app/profile/[userId]/following/page.js
// 팔로잉 목록 페이지

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getFollowing } from "@/actions/follow"
import FollowButton from "@/components/FollowButton"
import Link from "next/link"
import { ArrowLeft, UserCheck } from "lucide-react"

export default async function FollowingPage({ params }) {
  const session = await getServerSession(authOptions)
  const { userId } = params

  // 사용자 기본 정보 조회
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true
    }
  })

  if (!user) {
    notFound()
  }

  // 팔로잉 목록 조회
  const followingResult = await getFollowing(userId, 50)

  if (followingResult.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">오류가 발생했습니다</div>
          <p className="text-gray-600">{followingResult.error}</p>
        </div>
      </div>
    )
  }

  const following = followingResult.following || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        {/* 헤더 */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href={`/profile/${userId}`}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>

          <div className="flex items-center space-x-3">
            <img
              src={user.image || "/default-avatar.png"}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {user.name}님이 팔로우 중
              </h1>
              <p className="text-sm text-gray-500">
                총 {following.length}명
              </p>
            </div>
          </div>
        </div>

        {/* 팔로잉 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">팔로잉</h2>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                {following.length}
              </span>
            </div>
          </div>

          {following.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 팔로우한 사용자가 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                {session?.user.id === userId
                  ? "관심있는 사용자를 찾아서 팔로우해보세요!"
                  : `${user.name}님이 아직 아무도 팔로우하지 않았어요.`
                }
              </p>
              {session?.user.id === userId && (
                <Link
                  href="/search"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <span>사용자 찾기</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {following.map((followedUser) => (
                <div key={followedUser.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Link href={`/profile/${followedUser.id}`}>
                      <img
                        src={followedUser.image || "/default-avatar.png"}
                        alt={followedUser.name}
                        className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${followedUser.id}`}
                        className="block font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                      >
                        {followedUser.name}
                      </Link>

                      <p className="text-sm text-gray-500 mt-1">
                        @{followedUser.name.toLowerCase().replace(/\s+/g, '')}
                      </p>

                      {followedUser.bio && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {followedUser.bio}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>게시글 {followedUser._count?.posts || 0}개</span>
                        <span>팔로워 {followedUser._count?.followers || 0}명</span>
                        <span>
                          {new Date(followedUser.followedAt).toLocaleDateString('ko-KR')}부터 팔로잉
                        </span>
                      </div>
                    </div>

                    {/* 팔로우 버튼 (현재 사용자만 언팔로우 가능) */}
                    {session?.user.id === userId ? (
                      <FollowButton
                        targetUserId={followedUser.id}
                        initialIsFollowing={true}
                        size="small"
                      />
                    ) : (
                      <FollowButton
                        targetUserId={followedUser.id}
                        initialIsFollowing={false} // 실제로는 확인 필요
                        size="small"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
