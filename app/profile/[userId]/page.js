// app/profile/[userId]/page.js
// 다른 사용자의 프로필 페이지

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"  // redirect 추가! 🆕
import { db } from "@/lib/db"
import { getUserFollowStatus } from "@/actions/follow"
import FollowButton from "@/components/FollowButton"
import Link from "next/link"
import {
  Calendar,
  Mail,
  Grid3X3,
  Heart,
  MessageCircle,
  ArrowLeft,
  Shield,
  UserCheck
} from "lucide-react"

export default async function UserProfilePage({ params }) {
  const session = await getServerSession(authOptions)
  const { userId } = params

  // 사용자 정보 조회
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      },
      _count: {
        select: {
          posts: true
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  // 본인 프로필이면 기본 프로필 페이지로 리다이렉트
  if (session?.user.id === userId) {
    redirect('/profile')
  }

  // 팔로우 상태 정보 가져오기
  const followStatus = await getUserFollowStatus(userId)

  const joinDate = new Date(user.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long'
  })

  const isFollowedBy = followStatus.isFollowedBy // 상대가 나를 팔로우하는지

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">

        {/* 뒤로가기 헤더 */}
        <div className="flex items-center space-x-4 mb-6">
          <Link
            href="/"
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {user.name}님의 프로필
            </h1>
            <p className="text-sm text-gray-500">
              @{user.name.toLowerCase().replace(/\s+/g, '')}
            </p>
          </div>
        </div>

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="relative">
            {/* 커버 배경 */}
            <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

            {/* 프로필 정보 */}
            <div className="relative px-6 pb-6">
              {/* 프로필 이미지 */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
                <div className="relative -mt-16 mb-4 sm:mb-0">
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name}
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-white"
                  />

                  {/* 인증 배지 (예시) */}
                  {user._count.posts > 10 && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 border-3 border-white rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* 사용자 정보 */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {user.name}
                        </h1>

                        {/* 맞팔 표시 */}
                        {isFollowedBy && followStatus.isFollowing && (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            <UserCheck className="w-3 h-3" />
                            <span>맞팔</span>
                          </div>
                        )}

                        {/* 나를 팔로우함 표시 */}
                        {isFollowedBy && !followStatus.isFollowing && (
                          <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            회원님을 팔로우함
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{joinDate}에 가입</span>
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-gray-700 max-w-2xl leading-relaxed">
                          {user.bio}
                        </p>
                      )}
                    </div>

                    {/* 팔로우 버튼 */}
                    <div className="flex items-center space-x-3">
                      <FollowButton
                        targetUserId={userId}
                        initialIsFollowing={followStatus.isFollowing}
                        initialFollowersCount={followStatus.followersCount}
                        size="default"
                      />

                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        메시지
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-8 mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count.posts}
                  </div>
                  <div className="text-sm text-gray-600">게시글</div>
                </div>

                <Link
                  href={`/profile/${userId}/followers`}
                  className="text-center hover:bg-gray-50 rounded-lg p-3 transition-colors"
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {followStatus.followersCount}
                  </div>
                  <div className="text-sm text-gray-600">팔로워</div>
                </Link>

                <Link
                  href={`/profile/${userId}/following`}
                  className="text-center hover:bg-gray-50 rounded-lg p-3 transition-colors"
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {followStatus.followingCount}
                  </div>
                  <div className="text-sm text-gray-600">팔로잉</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 게시글 그리드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                게시글
              </h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {user.posts.length}
              </span>
            </div>
          </div>

          <div className="p-6">
            {user.posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 게시글이 없습니다
                </h3>
                <p className="text-gray-500">
                  {user.name}님이 첫 번째 게시글을 올릴 때까지 기다려보세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.posts.map((post) => (
                  <div
                    key={post.id}
                    className="relative aspect-square group cursor-pointer"
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.caption || "게시글 이미지"}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center space-x-6 text-white">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-6 h-6" />
                          <span className="font-semibold text-lg">
                            {post._count.likes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-6 h-6" />
                          <span className="font-semibold text-lg">
                            {post._count.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
