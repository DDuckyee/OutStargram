// app/create/page.js - 게시글 작성 페이지 (5단계 완전 새 버전)
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CreatePostForm from "@/components/CreatePostForm"
import { Camera, Image as ImageIcon, Sparkles, Lightbulb } from "lucide-react"

export const metadata = {
  title: "새 게시글 작성 - MyGram",
  description: "새로운 순간을 공유해보세요",
}

export default async function CreatePage() {
  // 로그인 확인
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새로운 순간을 공유하세요
          </h1>
          <p className="text-gray-600">
            멋진 사진과 함께 특별한 이야기를 들려주세요
          </p>
        </div>

        {/* Main Form Card */}
        <div className="card animate-scaleIn">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold text-gray-900">새 게시글 만들기</h2>
                <p className="text-sm text-gray-600">
                  {session.user.name}님의 새로운 이야기
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <CreatePostForm />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card p-6 animate-slideInFromRight" style={{animationDelay: '0.1s'}}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">게시글 작성 팁</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 고화질 이미지를 사용하면 더 멋진 피드가 됩니다</li>
                  <li>• 해시태그(#)를 사용해서 주제를 표시해보세요</li>
                  <li>• 솔직하고 진심어린 캡션이 더 많은 공감을 얻습니다</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-slideInFromRight" style={{animationDelay: '0.2s'}}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">이미지 가이드</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 최대 4MB까지 업로드 가능합니다</li>
                  <li>• PNG, JPG, WEBP 형식을 지원합니다</li>
                  <li>• 정사각형 비율이 가장 예쁘게 보입니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Inspiration Section */}
        <div className="mt-8 card p-6 animate-fadeIn" style={{animationDelay: '0.3s'}}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">아이디어가 필요하신가요?</h3>
            <p className="text-sm text-gray-600 mb-4">
              이런 주제들로 게시글을 만들어보세요!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "일상", "음식", "여행", "취미", "운동", "독서", 
                "영화", "음악", "반려동물", "자연", "카페", "친구들"
              ].map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-sm text-gray-700 hover:text-blue-700 rounded-full cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}