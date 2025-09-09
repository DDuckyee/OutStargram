// components/FollowButton.js
// 팔로우/언팔로우 버튼 컴포넌트

"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { toggleFollow } from "@/actions/follow"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"

export default function FollowButton({
  targetUserId,
  initialIsFollowing = false,
  initialFollowersCount = 0,
  size = "default",
  showCount = false
}) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [isPending, startTransition] = useTransition()

  // 로그인하지 않은 사용자나 본인일 때는 버튼 숨김
  if (!session || session.user.id === targetUserId) {
    return null
  }

  // 팔로우 토글 처리 (Optimistic Updates)
  const handleFollowToggle = () => {
    const newIsFollowing = !isFollowing
    const newFollowersCount = newIsFollowing
      ? followersCount + 1
      : followersCount - 1

    // 즉시 UI 업데이트 (Optimistic)
    setIsFollowing(newIsFollowing)
    setFollowersCount(newFollowersCount)

    // 서버 액션 실행
    startTransition(async () => {
      try {
        console.log(`${newIsFollowing ? '👥' : '💔'} 팔로우 토글 시작:`, targetUserId)

        const result = await toggleFollow(targetUserId)

        if (result.success) {
          // 서버 응답으로 정확한 상태 업데이트
          setIsFollowing(result.isFollowing)
          setFollowersCount(result.followersCount)

          console.log("✅ 팔로우 상태 업데이트 완료:", result.isFollowing)
        } else {
          // 실패시 원래 상태로 되돌리기
          setIsFollowing(!newIsFollowing)
          setFollowersCount(followersCount)

          console.error("❌ 팔로우 오류:", result.error)
          alert(result.error || "팔로우 처리에 실패했습니다.")
        }
      } catch (error) {
        // 네트워크 오류 등으로 실패시 원래 상태로 되돌리기
        setIsFollowing(!newIsFollowing)
        setFollowersCount(followersCount)

        console.error("❌ 팔로우 네트워크 오류:", error)
        alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
      }
    })
  }

  // 버튼 크기별 스타일
  const sizeClasses = {
    small: "px-3 py-1.5 text-xs",
    default: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  }

  // 아이콘 크기별 스타일
  const iconSizes = {
    small: "w-3 h-3",
    default: "w-4 h-4",
    large: "w-5 h-5"
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleFollowToggle}
        disabled={isPending}
        className={`
          flex items-center space-x-2 font-medium rounded-lg transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${isFollowing
            ? 'bg-gray-200 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-300'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
          }
        `}
      >
        {isPending ? (
          <>
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
            <span>처리중...</span>
          </>
        ) : isFollowing ? (
          <>
            <UserMinus className={iconSizes[size]} />
            <span>언팔로우</span>
          </>
        ) : (
          <>
            <UserPlus className={iconSizes[size]} />
            <span>팔로우</span>
          </>
        )}
      </button>

      {/* 팔로워 수 표시 (옵션) */}
      {showCount && (
        <span className="text-sm text-gray-500">
          팔로워 {followersCount.toLocaleString()}
        </span>
      )}
    </div>
  )
}
