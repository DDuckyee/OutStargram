// actions/posts.js
// 게시글 관련 서버 액션들 - 게시글 생성, 수정, 삭제를 처리합니다

"use server" // 🔥 중요! 이 지시어로 서버에서만 실행됨

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function createPost(formData) {
  try {
    console.log("📝 게시글 생성 시작...")
    
    // 🔐 1단계: 로그인 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("로그인이 필요합니다")
    }
    console.log("✅ 사용자 인증 완료:", session.user.name)

    // 📋 2단계: 폼 데이터 추출
    const imageUrl = formData.get("imageUrl")
    const caption = formData.get("caption")
    
    console.log("📷 이미지 URL:", imageUrl)
    console.log("💬 캡션:", caption)

    // ✅ 3단계: 데이터 유효성 검사
    if (!imageUrl || !imageUrl.trim()) {
      throw new Error("이미지는 필수입니다")
    }

    if (!caption || !caption.trim()) {
      throw new Error("캡션은 필수입니다")
    }

    if (caption.length > 2200) {
      throw new Error("캡션은 2200자 이하여야 합니다")
    }

    // 🔗 4단계: URL 형식 검증
    try {
      new URL(imageUrl) // URL이 올바른 형식인지 확인
    } catch {
      throw new Error("올바른 이미지 URL이 아닙니다")
    }

    console.log("✅ 데이터 검증 완료")

    // 💾 5단계: 데이터베이스에 저장
    const post = await db.post.create({
      data: {
        caption: caption.trim(),
        imageUrl: imageUrl.trim(),
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    console.log("✅ 데이터베이스 저장 완료:", post.id)

    // 🔄 6단계: 캐시 무효화 (홈페이지 새로고침)
    revalidatePath("/")
    console.log("✅ 캐시 무효화 완료")
    
    // 🏠 7단계: 홈페이지로 리다이렉트
    redirect("/")

  } catch (error) {
    console.error("❌ 게시글 생성 오류:", error)
    
    // 🚨 Prisma 에러 타입별 처리
    if (error.code === "P2002") {
      throw new Error("중복된 데이터입니다")
    }
    
    if (error.code === "P2025") {
      throw new Error("사용자를 찾을 수 없습니다")
    }

    // 일반 에러는 그대로 전달
    throw error
  }
}

// 게시글 삭제 함수 (나중에 사용)
export async function deletePost(postId) {
  try {
    console.log("🗑️ 게시글 삭제 시작:", postId)
    
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("로그인이 필요합니다")
    }

    // 게시글 소유자 확인
    const existingPost = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!existingPost) {
      throw new Error("게시글을 찾을 수 없습니다")
    }

    if (existingPost.authorId !== session.user.id) {
      throw new Error("게시글을 삭제할 권한이 없습니다")
    }

    await db.post.delete({
      where: { id: postId }
    })

    console.log("✅ 게시글 삭제 완료")
    revalidatePath("/")
    
    return { success: true }

  } catch (error) {
    console.error("❌ 게시글 삭제 오류:", error)
    throw error
  }
}