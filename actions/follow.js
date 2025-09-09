// actions/follow.js
// 팔로우 관련 서버 액션들

"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// 팔로우/언팔로우 토글 함수
export async function toggleFollow(targetUserId) {
  try {
    console.log("👥 팔로우 토글 시작:", targetUserId)

    // 로그인 확인
    const session = await getServerSession(authOptions)
    if (!session) {
      return { error: "로그인이 필요합니다" }
    }

    const currentUserId = session.user.id

    // 자기 자신을 팔로우하려는 경우 차단
    if (currentUserId === targetUserId) {
      return { error: "자기 자신은 팔로우할 수 없습니다" }
    }

    // 대상 사용자 존재 확인
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return { error: "사용자를 찾을 수 없습니다" }
    }

    // 현재 팔로우 상태 확인
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    })

    let isFollowing

    if (existingFollow) {
      // 이미 팔로우 중 → 언팔로우
      await db.follow.delete({
        where: {
          id: existingFollow.id
        }
      })
      isFollowing = false
      console.log("💔 언팔로우 완료")
    } else {
      // 팔로우하지 않음 → 팔로우
      await db.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      })
      isFollowing = true
      console.log("💖 팔로우 완료")
    }

    // 대상 사용자의 총 팔로워 수 계산
    const followersCount = await db.follow.count({
      where: { followingId: targetUserId }
    })

    console.log("✅ 현재 팔로워 수:", followersCount)

    // 관련 페이지 캐시 무효화
    revalidatePath("/")
    revalidatePath(`/profile/${targetUserId}`)
    revalidatePath(`/profile/${currentUserId}`)

    return {
      success: true,
      isFollowing,
      followersCount
    }

  } catch (error) {
    console.error("❌ 팔로우 처리 오류:", error)

    // Prisma 에러 처리
    if (error.code === "P2002") {
      return { error: "이미 팔로우하고 있습니다" }
    }

    if (error.code === "P2025") {
      return { error: "사용자를 찾을 수 없습니다" }
    }

    return { error: "팔로우 처리 중 오류가 발생했습니다" }
  }
}

// 사용자의 팔로우 상태 및 통계 가져오기
export async function getUserFollowStatus(targetUserId) {
  try {
    const session = await getServerSession(authOptions)

    // 팔로워/팔로잉 수 계산
    const [followersCount, followingCount] = await Promise.all([
      db.follow.count({
        where: { followingId: targetUserId }
      }),
      db.follow.count({
        where: { followerId: targetUserId }
      })
    ])

    let isFollowing = false
    let isFollowedBy = false

    if (session && session.user.id !== targetUserId) {
      // 현재 사용자가 대상 사용자를 팔로우하는지 확인
      const followingRelation = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: targetUserId
          }
        }
      })
      isFollowing = !!followingRelation

      // 대상 사용자가 현재 사용자를 팔로우하는지 확인 (맞팔 여부)
      const followerRelation = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: targetUserId,
            followingId: session.user.id
          }
        }
      })
      isFollowedBy = !!followerRelation
    }

    return {
      success: true,
      followersCount,
      followingCount,
      isFollowing,
      isFollowedBy
    }

  } catch (error) {
    console.error("❌ 팔로우 상태 조회 오류:", error)
    return {
      error: "팔로우 상태를 불러올 수 없습니다",
      followersCount: 0,
      followingCount: 0,
      isFollowing: false,
      isFollowedBy: false
    }
  }
}

// 팔로워 목록 가져오기
export async function getFollowers(userId, limit = 20) {
  try {
    const followers = await db.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            _count: {
              select: {
                posts: true,
                followers: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return {
      success: true,
      followers: followers.map(f => ({
        ...f.follower,
        followedAt: f.createdAt
      }))
    }

  } catch (error) {
    console.error("❌ 팔로워 목록 조회 오류:", error)
    return { error: "팔로워 목록을 불러올 수 없습니다" }
  }
}

// 팔로잉 목록 가져오기
export async function getFollowing(userId, limit = 20) {
  try {
    const following = await db.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            _count: {
              select: {
                posts: true,
                followers: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return {
      success: true,
      following: following.map(f => ({
        ...f.following,
        followedAt: f.createdAt
      }))
    }

  } catch (error) {
    console.error("❌ 팔로잉 목록 조회 오류:", error)
    return { error: "팔로잉 목록을 불러올 수 없습니다" }
  }
}

// 추천 사용자 가져오기 (간단한 알고리즘)
export async function getRecommendedUsers(limit = 10) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      // 로그인하지 않은 경우 인기 사용자 추천
      const popularUsers = await db.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          _count: {
            select: {
              posts: true,
              followers: true
            }
          }
        },
        orderBy: {
          followers: { _count: 'desc' }
        },
        take: limit
      })

      return { success: true, users: popularUsers }
    }

    // 로그인한 경우 개인화된 추천
    const currentUserId = session.user.id

    // 현재 사용자가 팔로우하지 않는 사용자 중에서
    // 팔로워 수가 많은 사용자들을 추천
    const recommendedUsers = await db.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } }, // 본인 제외
          {
            followers: {
              none: {
                followerId: currentUserId // 이미 팔로우하는 사용자 제외
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        _count: {
          select: {
            posts: true,
            followers: true
          }
        }
      },
      orderBy: [
        { followers: { _count: 'desc' } }, // 팔로워 수 우선
        { posts: { _count: 'desc' } },     // 게시글 수 차순
        { createdAt: 'desc' }              // 최신 가입자 차순
      ],
      take: limit
    })

    return { success: true, users: recommendedUsers }

  } catch (error) {
    console.error("❌ 추천 사용자 조회 오류:", error)
    return { error: "추천 사용자를 불러올 수 없습니다" }
  }
}
