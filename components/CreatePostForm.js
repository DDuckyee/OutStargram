// components/CreatePostForm.js
// 게시글 작성 폼 컴포넌트 - 서버 액션과 연결됩니다

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import ImageUpload from "./ImageUpload"
import { createPost } from "@/actions/posts"
import { 
  Image as ImageIcon, 
  Type, 
  Send, 
  ArrowLeft,
  AlertCircle,
  Hash,
  Smile,
  Loader2
} from "lucide-react"

export default function CreatePostForm() {
  const [imageUrl, setImageUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(1) // 1: image, 2: caption
  const [error, setError] = useState("")
  const router = useRouter()

  // 📤 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 🔍 클라이언트 사이드 검증
    if (!imageUrl) {
      setError("이미지를 먼저 업로드해주세요.")
      return
    }

    if (!caption.trim()) {
      setError("캡션을 입력해주세요.")
      return
    }

    if (caption.length > 2200) {
      setError("캡션은 2200자 이하여야 합니다.")
      return
    }

    setError("") // 에러 초기화

    // 🚀 서버 액션 실행
    startTransition(async () => {
      try {
        console.log("📤 게시글 업로드 시작...")
        
        // FormData 객체 생성 (서버 액션에 전달할 데이터)
        const formData = new FormData()
        formData.append("imageUrl", imageUrl)
        formData.append("caption", caption.trim())
        
        console.log("📋 FormData 생성 완료")
        
        // 🎯 서버 액션 호출
        await createPost(formData)
        
        // 성공시 서버 액션에서 자동으로 리다이렉트됨
        console.log("✅ 게시글 업로드 성공!")
        
      } catch (error) {
        console.error("❌ 게시글 업로드 실패:", error)
        setError(error.message || "게시글 업로드 중 오류가 발생했습니다.")
      }
    })
  }

  const handleNext = () => {
    if (imageUrl) {
      setCurrentStep(2)
      setError("")
    } else {
      setError("먼저 이미지를 업로드해주세요.")
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setError("")
  }

  const goHome = () => {
    if (confirm("작성 중인 내용이 사라집니다. 정말 나가시겠습니까?")) {
      router.push("/")
    }
  }

  return (
    <div className="space-y-6">
      {/* 🚨 에러 메시지 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* 📊 진행률 표시 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
          `}>
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
            이미지 선택
          </span>
        </div>
        
        <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'} transition-colors duration-300`}></div>
        
        <div className="flex items-center space-x-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
          `}>
            <Type className="w-4 h-4" />
          </div>
          <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
            캡션 작성
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1️⃣ 1단계: 이미지 업로드 */}
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <span>사진 선택</span>
              </label>
              <p className="text-sm text-gray-600 mb-4">
                공유하고 싶은 멋진 사진을 선택해주세요 (최대 4MB)
              </p>
              <ImageUpload
                onUploadComplete={setImageUrl}
                disabled={isPending}
              />
            </div>

            {imageUrl && (
              <div className="flex justify-end animate-slideInFromRight">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isPending}
                  className="btn-primary flex items-center space-x-2 px-6 py-3 disabled:opacity-50"
                >
                  <span>다음 단계</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2️⃣ 2단계: 캡션 작성 */}
        {currentStep === 2 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <label htmlFor="caption" className="block text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Type className="w-5 h-5 text-blue-600" />
                <span>캡션 작성</span>
              </label>
              <p className="text-sm text-gray-600 mb-4">
                이 순간에 대한 이야기를 들려주세요 (최대 2200자)
              </p>
              
              <div className="relative">
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={isPending}
                  rows={6}
                  className="input resize-none pr-12 disabled:opacity-50"
                  placeholder="이 순간에 대해 이야기해보세요... 

#좋은하루 #행복 #일상 같은 해시태그도 추가해보세요!"
                  maxLength={2200}
                />
                
                {/* 글자 수 카운터 */}
                <div className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded ${
                  caption.length > 2000 ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-white'
                }`}>
                  {caption.length}/2200
                </div>
              </div>

              {/* 인기 해시태그 */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2 flex items-center space-x-1">
                  <Hash className="w-4 h-4" />
                  <span>인기 해시태그</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {['#일상', '#행복', '#좋은하루', '#감사', '#친구', '#가족', '#여행', '#맛집'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!caption.includes(tag)) {
                          setCaption(prev => prev + (prev ? ' ' : '') + tag)
                        }
                      }}
                      disabled={isPending}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-full transition-colors disabled:opacity-50"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={isPending}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전</span>
              </button>
              
              <button
                type="submit"
                disabled={isPending || !imageUrl || !caption.trim()}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>게시 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>게시하기</span>
                  </>
                )}
              </button>
            </div>

            {/* 취소 버튼 */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={goHome}
                disabled={isPending}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors disabled:opacity-50"
              >
                취소하고 홈으로 돌아가기
              </button>
            </div>
          </div>
        )}

        {/* 📷 이미지 미리보기 (2단계에서) */}
        {currentStep === 2 && imageUrl && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-scaleIn">
            <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
            <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}