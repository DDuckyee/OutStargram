// lib/uploadthing-server.js
// UploadThing 서버 설정 - 이미지 업로드 규칙을 정의합니다

import { createUploadthing } from "uploadthing/next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// UploadThing 팩토리 함수 생성
const f = createUploadthing()

// 파일 업로드 라우터 정의
export const ourFileRouter = {
  // 이미지 업로더 설정
  imageUploader: f({ 
    image: { 
      maxFileSize: "4MB",     // 최대 4MB까지
      maxFileCount: 1         // 한 번에 1개 파일만
    } 
  })
    // 업로드 전에 실행되는 미들웨어 (보안 검사)
    .middleware(async () => {
      // 현재 로그인한 사용자 확인
      const session = await getServerSession(authOptions)
      
      // 로그인하지 않은 사용자는 업로드 불가
      if (!session) {
        throw new Error("로그인이 필요합니다")
      }

      console.log("✅ 업로드 권한 확인됨:", session.user.name)

      // 업로드 성공시 함께 저장할 메타데이터
      return { userId: session.user.id }
    })
    // 업로드 완료 후 실행되는 콜백
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ 이미지 업로드 완료!")
      console.log("📁 파일 URL:", file.url)
      console.log("👤 업로드한 사용자:", metadata.userId)
      
      // 클라이언트에 반환할 데이터
      return { 
        uploadedBy: metadata.userId, 
        url: file.url 
      }
    }),
}