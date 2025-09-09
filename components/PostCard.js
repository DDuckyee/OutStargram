// components/PostCard.js 최종 완성 버전
"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { toggleLike } from "@/actions/posts"
import CommentList from "./CommentList"
import CommentForm from "./CommentForm"
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react"

export default function PostCard({
  post,
  initialLikesCount,
  initialIsLiked
}) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments || [])
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0)
  const [isPending, startTransition] = useTransition()

  // 시간 계산 함수
  const getTimeAgo = (createdAt) => {
    const now = new Date()
    const postTime = new Date(createdAt)
    const diffInSeconds = Math.floor((now - postTime) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
    return postTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  // 좋아요 토글 처리 (개선된 애니메이션)
  const handleLikeToggle = () => {
    if (!session) {
      alert("로그인이 필요합니다.")
      return
    }

    const newIsLiked = !isLiked
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1

    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    startTransition(async () => {
      try {
        const result = await toggleLike(post.id)
        if (result.success) {
          setIsLiked(result.isLiked)
          setLikesCount(result.likesCount)
        }
      } catch (error) {
        console.error("좋아요 오류:", error)
        // 실패시 원래 상태로 되돌리기
        setIsLiked(!newIsLiked)
        setLikesCount(likesCount)
      }
    })
  }

  // 댓글 버튼 클릭 처리
  const handleCommentClick = () => {
    setShowComments(!showComments)
  }

  // 새 댓글 추가 처리
  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev])
    setCommentsCount(prev => prev + 1)
    setShowComments(true)
  }

  // 댓글 삭제 처리
  const handleCommentDeleted = (commentId) => {
    setCommentsCount(prev => prev - 1)
  }

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* 게시글 헤더 */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.author.id}`}>
            <img
              src={post.author.image || "/default-avatar.png"}
              alt={post.author.name}
              className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity ring-2 ring-offset-1 ring-transparent hover:ring-gray-200"
            />
          </Link>
          <div>
            <Link
              href={`/profile/${post.author.id}`}
              className="font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              {post.author.name}
            </Link>
            <p className="text-sm text-gray-500">{getTimeAgo(post.createdAt)}</p>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 이미지 */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={post.imageUrl}
          alt={post.caption || "게시글 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />

        {/* 이미지 위 더블탭 하트 효과 (나중에 구현) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
          <Heart className="w-20 h-20 text-white drop-shadow-lg" />
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLikeToggle}
              disabled={isPending}
              className={`group transition-all duration-300 ${
                isLiked
                  ? 'text-red-500 scale-110'
                  : 'text-gray-700 hover:text-red-500 hover:scale-110'
              }`}
            >
              <Heart
                className={`w-7 h-7 transition-all duration-300 ${
                  isLiked ? 'fill-current animate-pulse' : 'group-active:scale-75'
                }`}
              />
            </button>

            <button
              onClick={handleCommentClick}
              className="text-gray-700 hover:text-gray-900 hover:scale-110 transition-all duration-200"
            >
              <MessageCircle className="w-7 h-7" />
            </button>

            <button className="text-gray-700 hover:text-gray-900 hover:scale-110 transition-all duration-200">
              <Share className="w-7 h-7" />
            </button>
          </div>

          <button className="text-gray-700 hover:text-gray-900 hover:scale-110 transition-all duration-200">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <button className="block mb-2 hover:text-gray-600 transition-colors">
            <span className="font-semibold text-gray-900">
              좋아요 {likesCount.toLocaleString()}개
            </span>
          </button>
        )}

        {/* 캡션 */}
        <div className="text-gray-900 mb-2">
          <Link
            href={`/profile/${post.author.id}`}
            className="font-semibold mr-2 hover:text-gray-600 transition-colors"
          >
            {post.author.name}
          </Link>
          <span className="leading-relaxed">{post.caption}</span>
        </div>

        {/* 댓글 미리보기/토글 버튼 */}
        {commentsCount > 0 && (
          <button
            onClick={handleCommentClick}
            className="flex items-center space-x-1 text-gray-500 text-sm hover:text-gray-700 transition-colors mb-2"
          >
            <span>댓글 {commentsCount}개 {showComments ? '접기' : '모두 보기'}</span>
            {showComments ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {/* 시간 표시 */}
        <p className="text-gray-400 text-xs uppercase font-medium tracking-wide">
          {getTimeAgo(post.createdAt)}
        </p>
      </div>

      {/* 댓글 섹션 */}
      {showComments && commentsCount > 0 && (
        <div className="border-t border-gray-100 animate-slideDown">
          <CommentList
            comments={comments}
            postAuthorId={post.author.id}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <CommentForm
        postId={post.id}
        onCommentAdded={handleCommentAdded}
        placeholder={commentsCount > 0 ? "댓글 추가..." : "첫 번째 댓글을 작성해보세요..."}
      />
    </article>
  )
}
