// components/CommentList.js (향상된 버전)
"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { deleteComment } from "@/actions/posts"
import { Trash2, Heart, Reply, MoreVertical, Loader2, MessageCircle } from "lucide-react"

export default function CommentList({
  comments: initialComments,
  postAuthorId,
  onCommentDeleted
}) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const [showActionsForComment, setShowActionsForComment] = useState(null)
  const [isPending, startTransition] = useTransition()

  // 시간 표시 함수 (더 정확한 버전)
  const getTimeAgo = (createdAt) => {
    const now = new Date()
    const commentTime = new Date(createdAt)
    const diffInSeconds = Math.floor((now - commentTime) / 1000)

    if (diffInSeconds < 10) return '지금'
    if (diffInSeconds < 60) return `${diffInSeconds}초 전`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`

    // 일주일 이상은 날짜로 표시
    return commentTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  // 텍스트에서 멘션과 해시태그 처리
  const formatCommentText = (text) => {
    return text
      .split(/(\s+)/)
      .map((word, index) => {
        // 멘션 처리 (@username)
        if (word.startsWith('@') && word.length > 1) {
          const username = word.slice(1)
          return (
            <Link
              key={index}
              href={`/search?q=${username}`}
              className="mention"
            >
              {word}
            </Link>
          )
        }

        // 해시태그 처리 (#hashtag)
        if (word.startsWith('#') && word.length > 1) {
          const hashtag = word.slice(1)
          return (
            <Link
              key={index}
              href={`/search?q=${hashtag}`}
              className="hashtag"
            >
              {word}
            </Link>
          )
        }

        return word
      })
  }

  // 댓글 삭제 처리 (향상된 버전)
  const handleDeleteComment = async (commentId) => {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      return
    }

    setDeletingCommentId(commentId)

    startTransition(async () => {
      try {
        console.log("🗑️ 댓글 삭제 시작:", commentId)

        const result = await deleteComment(commentId)

        if (result.success) {
          console.log("✅ 댓글 삭제 완료!")

          // 애니메이션을 위한 지연 후 댓글 제거
          setTimeout(() => {
            setComments(prev => prev.filter(comment => comment.id !== commentId))

            // 부모 컴포넌트에 알림 (댓글 수 업데이트용)
            if (onCommentDeleted) {
              onCommentDeleted(commentId)
            }
          }, 300)

        } else {
          alert(result.error || "댓글 삭제에 실패했습니다.")
        }
      } catch (error) {
        console.error("❌ 댓글 삭제 오류:", error)
        alert("댓글 삭제 중 오류가 발생했습니다.")
      } finally {
        setDeletingCommentId(null)
        setShowActionsForComment(null)
      }
    })
  }

  // 새 댓글 추가
  const addNewComment = (newComment) => {
    setComments(prev => [newComment, ...prev])
  }

  // 댓글 삭제 권한 확인
  const canDeleteComment = (comment) => {
    if (!session) return false
    return comment.userId === session.user.id || postAuthorId === session.user.id
  }

  // 게시글 작성자 확인
  const isPostAuthor = (userId) => {
    return userId === postAuthorId
  }

  if (comments.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm mb-2">아직 댓글이 없습니다</p>
        <p className="text-gray-400 text-xs">첫 번째 댓글을 작성해보세요! 💬</p>
      </div>
    )
  }

  return (
    <div className="comment-list max-h-96 overflow-y-auto">
      {/* 댓글 수 헤더 */}
      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 z-10">
        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>댓글 {comments.length}개</span>
        </h4>
      </div>

      {/* 댓글 목록 */}
      <div className="px-4 py-2">
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`comment-item flex items-start space-x-3 group animate-slideInFromLeft ${
                deletingCommentId === comment.id ? 'opacity-50 animate-slideOutToRight' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 프로필 이미지 */}
              <Link href={`/profile/${comment.user.id}`}>
                <img
                  src={comment.user.image || "/default-avatar.png"}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                />
              </Link>

              {/* 댓글 내용 */}
              <div className="flex-1 min-w-0">
                <div className="comment-bubble">
                  {/* 작성자 정보 */}
                  <div className="flex items-center space-x-2 mb-1">
                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="font-semibold text-sm text-gray-900 hover:text-gray-600 transition-colors"
                    >
                      {comment.user.name}
                    </Link>

                    {/* 게시글 작성자 표시 */}
                    {isPostAuthor(comment.userId) && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        작성자
                      </span>
                    )}

                    <span className="comment-time">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  {/* 댓글 텍스트 */}
                  <div className="comment-content text-sm text-gray-800 leading-relaxed break-words">
                    {formatCommentText(comment.content)}
                  </div>
                </div>

                {/* 댓글 액션들 (좋아요, 답글 등) */}
                <div className="comment-actions flex items-center space-x-4 mt-1">
                  <button className="text-gray-500 hover:text-red-500 text-xs font-medium transition-colors">
                    좋아요
                  </button>
                  <button className="text-gray-500 hover:text-blue-500 text-xs font-medium transition-colors">
                    답글
                  </button>
                </div>
              </div>

              {/* 더보기 메뉴 */}
              <div className="comment-actions relative flex-shrink-0">
                <button
                  onClick={() => setShowActionsForComment(
                    showActionsForComment === comment.id ? null : comment.id
                  )}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 액션 메뉴 드롭다운 */}
                {showActionsForComment === comment.id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {deletingCommentId === comment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>삭제하기</span>
                      </button>
                    )}

                    {!canDeleteComment(comment) && (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        신고하기
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
