import { db } from '@/lib/db'

export default async function TestDBPage() {
  try {
    // 데이터베이스 연결 테스트
    await db.$connect()

    // 각 테이블의 레코드 수 확인
    const userCount = await db.user.count()
    const postCount = await db.post.count()
    const likeCount = await db.like.count()
    const commentCount = await db.comment.count()

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-green-600 mb-6 text-center">
            ✅ 데이터베이스 연결 성공!
          </h1>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">👤 사용자:</span>
              <span className="font-semibold">{userCount}명</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">📸 게시글:</span>
              <span className="font-semibold">{postCount}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">❤️ 좋아요:</span>
              <span className="font-semibold">{likeCount}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">💬 댓글:</span>
              <span className="font-semibold">{commentCount}개</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            URL: /test-db
          </p>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              ← 홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4 text-center">
            ❌ 데이터베이스 연결 실패
          </h1>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700 text-sm">
              <strong>오류:</strong> {error.message}
            </p>
          </div>
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              ← 홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  }
}
