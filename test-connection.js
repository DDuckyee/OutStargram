// 환경변수 로드
require('dotenv').config({ path: '.env.local' })

// 연결 정보 확인
console.log('=== 환경변수 확인 ===')
console.log('DATABASE_URL이 설정되었나요?', process.env.DATABASE_URL ? '✅ 예' : '❌ 아니오')

if (process.env.DATABASE_URL) {
  // URL에서 중요한 부분 숨기고 표시
  const url = process.env.DATABASE_URL
  const maskedUrl = url.replace(/:[^:@]*@/, ':****@')
  console.log('DATABASE_URL:', maskedUrl)
} else {
  console.log('❌ DATABASE_URL이 설정되지 않았습니다')
  console.log('💡 .env.local 파일을 확인해주세요')
}
