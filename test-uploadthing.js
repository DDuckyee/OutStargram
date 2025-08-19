// test-uploadthing.js (프로젝트 루트에 생성)
require('dotenv').config({ path: '.env' })

console.log('=== UploadThing 환경변수 확인 ===')
console.log('UPLOADTHING_SECRET:', process.env.UPLOADTHING_SECRET ? '✅ 설정됨' : '❌ 없음')
console.log('UPLOADTHING_APP_ID:', process.env.UPLOADTHING_APP_ID ? '✅ 설정됨' : '❌ 없음')

if (process.env.UPLOADTHING_SECRET) {
  // Secret의 앞 3글자만 표시 (보안)
  const maskedSecret = process.env.UPLOADTHING_SECRET.substring(0, 10) + '...'
  console.log('Secret 미리보기:', maskedSecret)
}