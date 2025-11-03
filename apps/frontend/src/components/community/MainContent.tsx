'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import LeftSidebar from './LeftSidebar'
import StoriesSection from './StoriesSection'
import PostCreator from './PostCreator'
import PostsFeed from './PostsFeed'
import SocialWall from './SocialWall'
import RightSidebar from './RightSidebar'

import type { Conversation, Event } from './community.types'
import { mockUser, mockConversations } from './data/mockCommunityData'
import { CommunityService } from '@/services/community'
import { PostResponseDTO, TagResponseDTO, UserWallResponseDTO } from '@/types/community.dtos'
import type { UserResponseDTO } from '@/types/user.dtos'
import { POST_STATUS } from '@/constants/index'
import { Skeleton } from '@/components/lib/ui/skeleton'
import { GeneralSkeleton } from '../generalUI/GeneralSkeleton'
import { useTranslate } from '@/i18n/hooks/useTranslate';

// Reusable filter state
export type FilterState =
  | { type: null }
  | { type: 'tag'; value: string }
  | { type: 'search'; value: string }

export default function MainContent() {
  const { t } = useTranslate('community');
  const [postText, setPostText] = useState('')
  const [selectedTab, setSelectedTab] = useState('Primary')
  const [posts, setPosts] = useState<PostResponseDTO[]>([])
  const [userWalls, setUserWalls] = useState<UserWallResponseDTO[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [trendingTags, setTrendingTags] = useState<TagResponseDTO[]>([])
  const [currentUser, setCurrentUser] = useState<UserWallResponseDTO | null>(null)
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public')

  // Infinite scroll state
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Wall view state
  const [openWallUserId, setOpenWallUserId] = useState<string | null>(null)
  const [openWallUserName, setOpenWallUserName] = useState<string | undefined>(undefined)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeFilter, setActiveFilter] = useState<FilterState>({ type: null })
  const [loading, setLoading] = useState(true)

  // Hydrate mock data
  useEffect(() => {
    setConversations(mockConversations)
  }, [])

  // Sync URL params (wall, wn)
  useEffect(() => {
    if (!searchParams) return
    const wallParam = searchParams.get('wall')
    const wnParam = searchParams.get('wn') || undefined
    setOpenWallUserId(wallParam)
    setOpenWallUserName(wnParam)
    if (wallParam) setActiveFilter({ type: null })
  }, [searchParams])

  const fetchMinimalUser = useCallback(async () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('currentUser')
      const localUser = raw ? (JSON.parse(raw) as UserResponseDTO) : null
      if (!localUser?._id) {
        setCurrentUser(null)
        return
      }
      const res = await CommunityService.getUserWall(localUser._id)
      if (res.success && res.data) {
        const minimalUser = res.data
        setCurrentUser((prev) => {
          if (!prev) return minimalUser
          const same =
            prev._id === minimalUser._id &&
            prev.followersCount === minimalUser.followersCount &&
            prev.followingsCount === minimalUser.followingsCount &&
            prev.postsCount === minimalUser.postsCount &&
            prev.fullName === minimalUser.fullName
          return same ? prev : minimalUser
        })
      } 
    } catch {
      setCurrentUser(null)
    }
  }, [])

  const fetchActiveMuas = useCallback(async () => {
    const res = await CommunityService.getTopActiveMuas(5)
    if (res.success && res.data) {
      setUserWalls(res.data)
    }
  }, [])

  const fetchPosts = useCallback(async (page = 1, reset = true) => {
    // Feed: sort by popularity (likes desc, then newest)
    const res = await CommunityService.listPosts({ page, limit: 10, sort: 'popular' })
    if (!res.success || !res.data) return
    
    let items = res.data.items
    setTotalPages(res.data.pages || 1)
    setHasMorePosts(page < (res.data.pages || 1))
    
    try {
      if (currentUser?._id && items.length) {
        const likedRes = await CommunityService.getMyLikedPosts(items.map((p) => p._id))
        if (likedRes.success && likedRes.data) {
          const likedSet = new Set(likedRes.data)
          items = items.map((p) => ({ ...(p as any), _isLiked: likedSet.has(p._id) }))
        }
      }
    } catch {
      // ignore
    }
    
    if (reset) {
      setPosts(items)
      setCurrentPage(1)
    } else {
      setPosts(prev => [...prev, ...items])
      setCurrentPage(page)
    }
  }, [currentUser?._id])

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) return
    
    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      await fetchPosts(nextPage, false)
    } catch (error) {
      console.error('Failed to load more posts:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMorePosts, currentPage, fetchPosts])

  const fetchTrendingTags = useCallback(async () => {
    const res = await CommunityService.getTrendingTags(5)
    if (res.success && res.data) {
      setTrendingTags(res.data)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchMinimalUser(), fetchActiveMuas(), fetchPosts(1, true), fetchTrendingTags()])
      setLoading(false)
    }
    init()
  }, [fetchMinimalUser, fetchActiveMuas, fetchPosts, fetchTrendingTags])

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Only trigger on main feed (not on wall or filtered views)
      if (openWallUserId || activeFilter.type || isLoadingMore || !hasMorePosts) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Calculate scroll percentage
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight

      // Trigger load more when user scrolls 80% or more
      if (scrollPercentage >= 0.8) {
        loadMorePosts()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [openWallUserId, activeFilter.type, isLoadingMore, hasMorePosts, loadMorePosts])

  const currentUserMinimal = useMemo(
    () =>
      currentUser
        ? ({ fullName: currentUser.fullName, _id: currentUser._id, avatarUrl: currentUser.avatarUrl } as any)
        : ({ fullName: '' } as any),
    [currentUser?._id, currentUser?.fullName]
  )

  const clearFilter = () => {
    setActiveFilter({ type: null })
    setCurrentPage(1)
    setHasMorePosts(true)
    fetchPosts(1, true)
  }

  const handleOpenUserWall = useCallback(
    (userId: string, userName?: string) => {
      setOpenWallUserId(userId)
      setOpenWallUserName(userName)
      setActiveFilter({ type: null })
      try {
        const sp = new URLSearchParams(searchParams?.toString())
        sp.set('wall', userId)
        if (userName) sp.set('wn', userName)
        else sp.delete('wn')
        const qs = sp.toString()
        router.push((qs ? `${pathname}?${qs}` : pathname) as any, { scroll: false })
      } catch {}
    },
    [pathname, router, searchParams]
  )

  const handleCloseUserWall = useCallback(() => {
    setOpenWallUserId(null)
    setOpenWallUserName(undefined)
    try {
      const sp = new URLSearchParams(searchParams?.toString())
      sp.delete('wall')
      sp.delete('wn')
      const qs = sp.toString()
      router.push((qs ? `${pathname}?${qs}` : pathname) as any, { scroll: false })
    } catch {}
  }, [pathname, router, searchParams])

  const isSelf = useMemo(
    () => currentUser?._id && openWallUserId && currentUser._id === openWallUserId,
    [currentUser?._id, openWallUserId]
  )

  const renderCenter = () => {
    if (openWallUserId) {
      return (
        <>
          {!isSelf && (
            <div className="mb-4 text-sm text-gray-500">
              <button type="button" className="hover:underline" onClick={handleCloseUserWall}>
                {t('mainContent.community')}
              </button>
              <span className="px-1">/</span>
              <span className="text-gray-900 font-medium">
                {openWallUserName || t('mainContent.userWall')}
              </span>
            </div>
          )}
          <SocialWall userId={openWallUserId} />
        </>
      )
    }

    if (activeFilter.type) {
      return (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">{t('mainContent.filteringBy')}</span>
            {activeFilter.type === 'tag' && (
              <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-sm">
                #{activeFilter.value}
              </span>
            )}
            {activeFilter.type === 'search' && (
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm">
                "{activeFilter.value}"
              </span>
            )}
            <button
              onClick={clearFilter}
              className="ml-auto text-sm text-rose-600 hover:underline"
            >
              {t('mainContent.clearFilter')}
            </button>
          </div>
          <PostsFeed
            posts={posts.filter((p) => p.status !== POST_STATUS.PRIVATE)}
            setPosts={setPosts}
            currentUser={currentUserMinimal}
            fetchMinimalUser={fetchMinimalUser}
            onOpenUserWall={handleOpenUserWall}
            
          />
        </>
      )
    }

    return (
      <>
        <StoriesSection
          userWalls={userWalls}
          currentUser={(currentUser as any) ?? (mockUser as any)}
        />
        <PostCreator
          postText={postText}
          setPostText={setPostText}
          privacy={privacy}
          setPrivacy={setPrivacy}
          posts={posts}
          setPosts={setPosts}
          currentUser={(currentUser as any) ?? (mockUser as any)}
          fetchMinimalUser={fetchMinimalUser}
        />
        <PostsFeed
          posts={posts.filter((p) => p.status !== POST_STATUS.PRIVATE)}
          setPosts={setPosts}
          currentUser={(currentUser as any) ?? (mockUser as any)}
          fetchMinimalUser={fetchMinimalUser}
          onOpenUserWall={handleOpenUserWall}
          
        />
        
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-600"></div>
              <span className="text-sm">{t('mainContent.loadingMorePosts')}</span>
            </div>
          </div>
        )}
        
        {/* End of posts indicator */}
        {!hasMorePosts && posts.length > 0 && (
          <div className="flex justify-center py-8">
            <span className="text-sm text-gray-400">{t('mainContent.endOfFeed')}</span>
          </div>
        )}
      </>
    )
  }

  // 🔹 Loading skeleton UI
  if (loading) {
    return (
  <div className="min-h-screen bg-white z-20"> {/* 👈 nền hồng nhạt toàn trang */}
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 p-4">
      {/* Left sidebar skeleton */}
      <div className="hidden md:block md:w-64 lg:w-72 xl:w-80 space-y-4">
        <Skeleton className="h-10 w-3/4 bg-rose-200" />
        <Skeleton className="h-6 w-1/2 bg-rose-200" />
        <Skeleton className="h-40 w-full bg-rose-200" />
      </div>
      {/* Center skeleton */}
      <div className="flex-1 w-full max-w-2xl mx-auto space-y-4">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-16 h-16 rounded-full bg-rose-200" />
          ))}
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="flex space-x-2">
            <Skeleton className="w-10 h-10 rounded-full bg-rose-200" />
            <Skeleton className="h-10 flex-1 bg-rose-200" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white rounded-xl shadow-sm space-y-2"
          >
            <Skeleton className="h-4 w-1/3 bg-rose-200" />
            <Skeleton className="h-6 w-2/3 bg-rose-200" />
            <Skeleton className="h-40 w-full bg-rose-200" />
          </div>
        ))}
      </div>
      {/* Right sidebar skeleton */}
      <div className="hidden lg:block lg:w-72 xl:w-80 space-y-4">
        <Skeleton className="h-10 w-1/2 bg-rose-200" />
        <Skeleton className="h-24 w-full bg-rose-200" />
        <Skeleton className="h-24 w-full bg-rose-200" />
      </div>
    </div>
  </div>
)
  }

  // 🔹 UI thật
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
          <LeftSidebar
            userWalls={userWalls}
            setUserWalls={setUserWalls}
            currentUser={(currentUser as any) ?? (mockUser as any)}
            trendingTags={trendingTags}
            posts={posts}
            setPosts={setPosts}
            fetchPosts={fetchPosts}
            fetchActiveMuas={fetchActiveMuas}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            resetPagination={() => {
              setCurrentPage(1)
              setHasMorePosts(true)
            }}
          />
        <div className="flex-1 w-full max-w-2xl mx-auto my-4">{renderCenter()}</div>
          <RightSidebar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            conversations={conversations}
            currentUser={(currentUser as any) ?? (mockUser as any)}
            events={events}
          />
      </div>
    </div>
  );
}
