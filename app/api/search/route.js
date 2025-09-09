// app/api/search/route.js
// 검색 API 엔드포인트

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    console.log("🔍 검색 API 호출:", query)

    // 빈 검색어 체크
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "검색어를 입력해주세요"
      })
    }

    // 검색어가 너무 짧으면 빈 결과 반환
    if (query.trim().length < 1) {
      return NextResponse.json({
        success: true,
        users: [],
        hashtags: []
      })
    }

    const searchTerm = query.trim()
    console.log("📝 정제된 검색어:", searchTerm)

    // 현재 사용자 정보 (로그인 체크)
    const session = await getServerSession(authOptions)

    // 1. 사용자 검색 (이름으로 검색)
    const users = await db.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'  // 대소문자 무시
            }
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ],
        // 본인은 검색 결과에서 제외
        NOT: session ? {
          id: session.user.id
        } : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      take: 10,  // 최대 10명까지
      orderBy: {
        posts: {
          _count: 'desc'  // 게시글이 많은 순서대로
        }
      }
    })

    // 2. 해시태그 검색 (게시글 캡션에서 해시태그 추출)
    const postsWithHashtags = await db.post.findMany({
      where: {
        caption: {
          contains: `#${searchTerm}`,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        caption: true
      }
    })

    // 해시태그 빈도 계산
    const hashtagCounts = new Map()

    postsWithHashtags.forEach(post => {
      if (post.caption) {
        // 캡션에서 해시태그 추출 (정규식 사용)
        const hashtags = post.caption.match(/#[\w가-힣]+/g) || []

        hashtags.forEach(tag => {
          const cleanTag = tag.slice(1).toLowerCase() // # 제거하고 소문자로

          if (cleanTag.includes(searchTerm.toLowerCase())) {
            hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1)
          }
        })
      }
    })

    // 해시태그 결과 정리 (사용 빈도순)
    const hashtags = Array.from(hashtagCounts.entries())
      .map(([tag, count]) => ({
        tag,
        count
      }))
      .sort((a, b) => b.count - a.count)  // 빈도 높은 순
      .slice(0, 8)  // 최대 8개까지

    console.log("👤 사용자 검색 결과:", users.length, "명")
    console.log("#️⃣ 해시태그 검색 결과:", hashtags.length, "개")

    return NextResponse.json({
      success: true,
      users,
      hashtags,
      searchTerm
    })

  } catch (error) {
    console.error("❌ 검색 API 오류:", error)

    return NextResponse.json({
      success: false,
      error: "검색 중 오류가 발생했습니다"
    }, { status: 500 })
  }
}
