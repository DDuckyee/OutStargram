import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import {
  User,
  Calendar,
  Mail,
  Edit3,
  Grid3X3,
  Settings
} from "lucide-react"

export default async function ProfilePage() {
  // 로그인 확인
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // 사용자 정보 조회
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: true,
      _count: {
        select: {
          posts: true,
          likes: true,
          comments: true,
        }
      }
    }
  })

  const joinDate = new Date(user.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="relative">
            {/* 커버 배경 */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

            {/* 프로필 정보 */}
            <div className="relative px-6 pb-6">
              {/* 프로필 이미지 */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
                <div className="relative -mt-16 mb-4 sm:mb-0">
                  <img
                    src={user?.image || "/default-avatar.png"}
                    alt={user?.name || "사용자"}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                </div>

                {/* 사용자 정보 */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {user?.name || "이름 없음"}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{joinDate}에 가입</span>
                        </div>
                      </div>
                      {user?.bio && (
                        <p className="text-gray-700 max-w-2xl">
                          {user.bio}
                        </p>
                      )}
                    </div>

                    <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-4 sm:mt-0">
                      <Edit3 className="w-4 h-4" />
                      <span>프로필 편집</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count.posts}
                  </div>
                  <div className="text-sm text-gray-600">게시글</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count.likes}
                  </div>
                  <div className="text-sm text-gray-600">받은 좋아요</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count.comments}
                  </div>
                  <div className="text-sm text-gray-600">작성한 댓글</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 게시글 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                내 게시글
              </h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {user.posts.length}
              </span>
            </div>
          </div>

          <div className="p-6">
            {user.posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 게시글이 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  첫 번째 게시글을 올려서 프로필을 꾸며보세요!
                </p>
                <a href="/create" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  첫 게시글 작성하기
                </a>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">게시글 목록이 곧 구현될 예정입니다! 🚀</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
