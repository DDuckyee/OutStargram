// components/CommentForm.js (향상된 버전)
"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { addComment } from "@/actions/posts"
import { Send, Loader2, Smile } from "lucide-react"

export default function CommentForm({
  postId,
  onCommentAdded,
  placeholder = "댓글을 작성하세요...",
  autoFocus = false
}) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  // 자동 포커스
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // 댓글 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!session) {
      alert("로그인이 필요합니다.")
      return
    }

    if (!content.trim()) {
      setError("댓글 내용을 입력해주세요.")
      textareaRef.current?.focus()
      return
    }

    if (content.length > 1000) {
      setError("댓글은 1000자 이하여야 합니다.")
      return
    }

    setError("")

    startTransition(async () => {
      try {
        console.log("💬 댓글 작성 시작...")

        const formData = new FormData()
        formData.append("postId", postId)
        formData.append("content", content.trim())

        const result = await addComment(formData)

        if (result.success) {
          console.log("✅ 댓글 작성 완료!")
          setContent("")
          setIsFocused(false)

          // 텍스트에리어 높이 초기화
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
          }

          if (onCommentAdded) {
            onCommentAdded(result.comment)
          }
        } else {
          setError(result.error || "댓글 작성에 실패했습니다.")
        }
      } catch (error) {
        console.error("❌ 댓글 작성 오류:", error)
        setError("댓글 작성 중 오류가 발생했습니다.")
      }
    })
  }

  // Enter 키 처리 (Shift+Enter는 줄바꿈, Enter만 누르면 전송)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // 텍스트에리어 높이 자동 조절
  const handleTextareaChange = (e) => {
    const textarea = e.target
    setContent(textarea.value)

    // 높이 자동 조절
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 120)
    textarea.style.height = newHeight + 'px'
  }

  // 로그인하지 않은 사용자
  if (!session) {
    return (
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <div className="text-center text-gray-500 text-sm py-4">
          <p className="mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            로그인하기
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`border-t border-gray-100 transition-all duration-200 ${
      isFocused ? 'bg-white shadow-inner' : 'bg-gray-50'
    }`}>
      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 pt-3">
          <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-3">
          {/* 프로필 이미지 */}
          <img
            src={session.user.image}
            alt={session.user.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />

          {/* 입력 영역 */}
          <div className="flex-1">
            <div className={`flex items-end space-x-2 p-2 border rounded-2xl transition-all duration-200 ${
              isFocused
                ? 'border-blue-500 shadow-sm bg-white'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isPending}
                placeholder={placeholder}
                className="flex-1 resize-none bg-transparent text-sm focus:outline-none disabled:opacity-50 placeholder-gray-500"
                rows={1}
                style={{
                  minHeight: '20px',
                  maxHeight: '120px',
                }}
                maxLength={1000}
              />

              {/* 이모지 버튼 (나중에 구현 예정) */}
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="이모지 추가"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* 전송 버튼 */}
              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                  content.trim() && !isPending
                    ? 'bg-blue-600 hover:bg-blue-700 text-white scale-100'
                    : 'bg-gray-200 text-gray-400 scale-90'
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* 하단 정보 */}
            <div className="flex items-center justify-between mt-2 px-2">
              <div className="text-xs text-gray-400">
                {isFocused && "Shift + Enter로 줄바꿈, Enter로 전송"}
              </div>

              <div className={`text-xs transition-colors ${
                content.length > 900 ? 'text-red-500 font-medium' : 'text-gray-400'
              }`}>
                {content.length}/1000
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
