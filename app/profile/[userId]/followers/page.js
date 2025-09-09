// app/profile/[userId]/followers/page.js
// 팔로워 목록 페이지

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getFollowers } from "@/actions/follow"
import FollowButton from "@/components/FollowButton"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

export default async function FollowersPage({ params }) {
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

  // 팔로워 목록 조회
  const followersResult = await getFollowers(userId, 50)

  if (followersResult.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">오류가 발생했습니다</div>
          <p className="text-gray-600">{followersResult.error}</p>
        </div>
      </div>
    )
  }

  const followers = followersResult.followers || []

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
                {user.name}님의 팔로워
              </h1>
              <p className="text-sm text-gray-500">
                총 {followers.length}명
              </p>
            </div>
          </div>
        </div>

        {/* 팔로워 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">팔로워</h2>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                {followers.length}
              </span>
            </div>
          </div>

          {followers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 팔로워가 없습니다
              </h3>
              <p className="text-gray-500">
                {session?.user.id === userId
                  ? "새로운 게시글을 올려서 팔로워를 늘려보세요!"
                  : `${user.name}님이 첫 번째 팔로워를 기다리고 있어요!`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {followers.map((follower) => (
                <div key={follower.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Link href={`/profile/${follower.id}`}>
                      <img
                        src={follower.image || "/default-avatar.png"}
                        alt={follower.name}
                        className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${follower.id}`}
                        className="block font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                      >
                        {follower.name}
                      </Link>

                      <p className="text-sm text-gray-500 mt-1">
                        @{follower.name.toLowerCase().replace(/\s+/g, '')}
                      </p>

                      {follower.bio && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {follower.bio}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>게시글 {follower._count?.posts || 0}개</span>
                        <span>팔로워 {follower._count?.followers || 0}명</span>
                        <span>
                          {new Date(follower.followedAt).toLocaleDateString('ko-KR')}부터 팔로잉
                        </span>
                      </div>
                    </div>

                    {/* 팔로우 버튼 */}
                    <FollowButton
                      targetUserId={follower.id}
                      initialIsFollowing={false} // 실제로는 현재 사용자의 팔로우 상태를 확인해야 함
                      size="small"
                    />
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
