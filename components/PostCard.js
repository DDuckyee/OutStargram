// 개별 게시글 카드 컴포넌트
"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { toggleLike } from "@/actions/posts"
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal
} from "lucide-react"

export default function PostCard({ post, initialLikesCount, initialIsLiked }) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isPending, startTransition] = useTransition()

  // 시간 계산 함수 (예: "2시간 전")
  const getTimeAgo = (createdAt) => {
    const now = new Date()
    const postTime = new Date(createdAt)
    const diffInSeconds = Math.floor((now - postTime) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
    return postTime.toLocaleDateString('ko-KR')
  }

  // 좋아요 토글 처리
  const handleLikeToggle = () => {
    if (!session) {
      alert("로그인이 필요합니다.")
      return
    }

    // Optimistic Update: 서버 응답을 기다리지 않고 즉시 UI 업데이트
    const newIsLiked = !isLiked
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1

    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    // 서버 액션 실행
    startTransition(async () => {
      try {
        const result = await toggleLike(post.id)

        // 서버 응답과 다르면 실제 값으로 수정
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

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* 게시글 헤더 */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.author.id}`}>
            <img
              src={post.author.image}
              alt={post.author.name}
              className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity"
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

        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 이미지 */}
      <div className="relative aspect-square">
        <Image
          src={post.imageUrl}
          alt={post.caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>

      {/* 액션 버튼들 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLikeToggle}
              disabled={isPending}
              className={`transition-all duration-200 ${
                isLiked
                  ? 'text-red-500 scale-110'
                  : 'text-gray-700 hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`}
              />
            </button>

            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>

            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <Share className="w-6 h-6" />
            </button>
          </div>

          <button className="text-gray-700 hover:text-gray-900 transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <p className="font-semibold text-gray-900 mb-2">
            좋아요 {likesCount.toLocaleString()}개
          </p>
        )}

        {/* 캡션 */}
        <div className="text-gray-900">
          <span className="font-semibold mr-2">{post.author.name}</span>
          <span>{post.caption}</span>
        </div>

        {/* 댓글 미리보기 (나중에 구현) */}
        <button className="text-gray-500 text-sm mt-1 hover:text-gray-700 transition-colors">
          댓글 모두 보기
        </button>
      </div>
    </article>
  )
}
