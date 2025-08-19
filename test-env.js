// test-env.js (프로젝트 루트에 생성)
require('dotenv').config({ path: '.env' })

console.log('=== 환경변수 확인 ===')
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✅ 설정됨' : '❌ 없음')
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ 설정됨' : '❌ 없음')
