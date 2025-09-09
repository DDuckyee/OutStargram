// 홈페이지 - 게시글 피드 표시
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getPostsWithLikes } from "@/actions/posts"
import Link from "next/link"
import PostCard from "@/components/PostCard"
import { Camera, Heart, Users, Sparkles, ArrowRight, Plus } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // 로그인하지 않은 사용자용 랜딩 페이지
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          {/* 메인 헤로 */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 animate-pulse">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MyGram
              </span>에 오신 걸 환영합니다!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              친구들과 소중한 순간을 공유하고, 새로운 사람들과 연결되며,
              일상의 아름다운 이야기들을 함께 만들어가세요.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <span>GitHub로 시작하기</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* 기능 소개 */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-4">
                <Camera className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">사진 공유</h3>
              <p className="text-gray-600">멋진 순간들을 기록하고 친구들과 공유하세요</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">실시간 소통</h3>
              <p className="text-gray-600">좋아요와 댓글로 친구들과 소통하세요</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">새로운 연결</h3>
              <p className="text-gray-600">관심사가 비슷한 사람들과 연결되세요</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 로그인한 사용자: 게시글 피드 표시
  const result = await getPostsWithLikes()

  if (result.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">오류가 발생했습니다</div>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    )
  }

  const posts = result.posts || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8">
        {/* 환영 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  안녕하세요, {session.user.name}님! 👋
                </h1>
                <p className="text-gray-600">오늘은 어떤 특별한 순간을 공유해볼까요?</p>
              </div>
            </div>

            <Link
              href="/create"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>게시글 작성</span>
            </Link>
          </div>
        </div>

        {/* 게시글 피드 */}
        {posts.length === 0 ? (
          // 게시글이 없을 때
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center animate-scaleIn">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 게시글이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 게시글을 작성해서 여러분의 이야기를 시작해보세요!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              <span>첫 게시글 작성하기</span>
            </Link>
          </div>
        ) : (
          // 게시글 목록
          <div className="space-y-8">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard
                  post={post}
                  initialLikesCount={post.likesCount}
                  initialIsLiked={post.isLiked}
                />
              </div>
            ))}
          </div>
        )}

        {/* 더 많은 콘텐츠 로드 (나중에 구현 예정) */}
        {posts.length > 0 && (
          <div className="text-center mt-12 py-8">
            <p className="text-gray-500 text-sm">
              🎉 모든 게시글을 확인하셨습니다!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>새 게시글 작성하기</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
