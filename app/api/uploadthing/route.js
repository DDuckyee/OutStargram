// UploadThing API 엔드포인트
import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "@/lib/uploadthing-server"

// API 핸들러 생성
const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})

// Next.js App Router에서 사용하기 위해 export
export { GET, POST }
