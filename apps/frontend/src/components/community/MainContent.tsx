'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import LeftSidebar from './LeftSidebar'
import StoriesSection from './StoriesSection'
import PostCreator from './PostCreator'
import PostsFeed from './PostsFeed'
import SocialWall from './SocialWall'
import RightSidebar from './RightSidebar'
import MiniChatBox from './chat/MiniChatBox'

import type { Event } from './community.types'
import { CommunityService } from '@/services/community'
import { UserService } from '@/services/user'
import { PostResponseDTO, TagResponseDTO, UserWallResponseDTO } from '@/types/community.dtos'
import type { UserResponseDTO } from '@/types/user.dtos'
import { POST_STATUS } from '@/constants/index'
import { Skeleton } from '@/components/lib/ui/skeleton'
import { GeneralSkeleton } from '../generalUI/GeneralSkeleton'
import { useTranslate } from '@/i18n/hooks/useTranslate';
import { toast } from 'sonner'

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
  const [events] = useState<Event[]>([])
  const [trendingTags, setTrendingTags] = useState<TagResponseDTO[]>([])
  const [currentUser, setCurrentUser] = useState<UserWallResponseDTO | null>(null)
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public')

  // Infinite scroll state
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Wall view state
  const [openWallUserId, setOpenWallUserId] = useState<string | null>(null)
  const [openWallUserName, setOpenWallUserName] = useState<string | undefined>(undefined)

  // Mini chat state
  const [activeChats, setActiveChats] = useState<{ conversation: any; user: any }[]>([])

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeFilter, setActiveFilter] = useState<FilterState>({ type: null })
  const [loading, setLoading] = useState(true)

  const [minimizedChats, setMinimizedChats] = useState<{ conversation: any; user: any }[]>([]);


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
    if (!globalThis.window) return
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

  const onConversationClick = (conversation: any) => {
    const otherUser = conversation.participants.find((p: any) => p._id !== currentUser?._id);
    if (!otherUser) return;

    const existsInActive = activeChats.some((c) => c.conversation._id === conversation._id);
    const existsInMinimized = minimizedChats.some((c) => c.conversation._id === conversation._id);

    if (existsInActive) return; // Đã mở

    if (existsInMinimized) {
      // Mở lại nếu còn chỗ trống
      if (activeChats.length < 5) {
        setMinimizedChats((prev) =>
          prev.filter((c) => c.conversation._id !== conversation._id)
        );
        setActiveChats((prev) => [...prev, conversation]);
      }
      return;
    }

    // Nếu còn chỗ trống -> mở mới
    if (activeChats.length < 5) {
      setActiveChats((prev) => [
        ...prev,
        { conversation, user: otherUser },
      ]);
    } else if (conversation.lastMessage) {
      // Nếu đủ 5 -> tự thu nhỏ, but only if conversation already has messages
      setMinimizedChats((prev) => [
        ...prev,
        { conversation, user: otherUser },
      ]);
    }
  }
  const onClose = (chat: any) => {
    setActiveChats((prev) =>
      prev.filter((c) => c.conversation._id !== chat.conversation._id)
    );
    // Only add to minimized if it's not a temporary conversation without messages
    const isTemp = !!chat.conversation?._isTemp;
    const hasMessages = !!chat.conversation?.lastMessage;
    if (!isTemp || hasMessages) {
      setMinimizedChats((prev) => {
        const exists = prev.some((c) => c.conversation._id === chat.conversation._id);
        return exists ? prev : [...prev, chat];
      });
    }
  }


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
      } catch { }
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
    } catch { }
  }, [pathname, router, searchParams])

  // Mini chat handlers
  const handleOpenMiniChat = useCallback((userId: string) => {
    console.log("Opening mini chat for user:", userId);

    // Check if chat is already open
    const isChatOpen = activeChats.some(chat =>
      chat.conversation.participants.some((p: any) => p._id === userId)
    );

    if (isChatOpen) {
      // If chat is already open, just bring it to front
      setActiveChats(prev => {
        const chatIndex = prev.findIndex(chat =>
          chat.conversation.participants.some((p: any) => p._id === userId)
        );
        if (chatIndex === -1) return prev;

        const newChats = [...prev];
        const [chatToMove] = newChats.splice(chatIndex, 1);
        return [...newChats, chatToMove];
      });
      return;
    }

    // If chat is not open, create a new temporary conversation and try to fetch
    // the user's details so avatar and name are available immediately.
    (async () => {
      const tempConv: any = {
        _id: `temp-${Date.now()}`,
        participants: [
          { _id: userId },
          { _id: currentUser?._id }
        ],
        type: 'private',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: null,
        _isTemp: true,
      };

      let userData: any = { _id: userId, fullName: 'Loading...', avatarUrl: '' };
      try {
        const res = await UserService.getUserById(userId);
        if (res && res.success && res.data) userData = res.data;
      } catch (e) {
        // ignore, keep placeholder
      }

      const newChat = { conversation: tempConv, user: userData };
      setActiveChats(prev => [...prev, newChat]);
    })();
  }, [activeChats, currentUser?._id]);

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
          <SocialWall userId={openWallUserId} onOpenMiniChat={handleOpenMiniChat} />
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
            onOpenMiniChat={handleOpenMiniChat}
          />
        </>
      )
    }

    return (
      <>
        <StoriesSection
          userWalls={userWalls}
          currentUser={currentUser}
        />
        <PostCreator
          postText={postText}
          setPostText={setPostText}
          privacy={privacy}
          setPrivacy={setPrivacy}
          posts={posts}
          setPosts={setPosts}
          currentUser={currentUser}
          fetchMinimalUser={fetchMinimalUser}
        />
        <PostsFeed
          posts={posts.filter((p) => p.status !== POST_STATUS.PRIVATE)}
          setPosts={setPosts}
          currentUser={currentUser}
          fetchMinimalUser={fetchMinimalUser}
          onOpenUserWall={handleOpenUserWall}   
          onOpenMiniChat={handleOpenMiniChat}
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
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={`story-skeleton-${i}`} className="w-16 h-16 rounded-full bg-rose-200" />
              ))}
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <div className="flex space-x-2">
                <Skeleton className="w-10 h-10 rounded-full bg-rose-200" />
                <Skeleton className="h-10 flex-1 bg-rose-200" />
              </div>
            </div>
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={`post-skeleton-${i}`}
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
          currentUser={currentUser}
          trendingTags={trendingTags}
          posts={posts}
          setPosts={setPosts}
          fetchPosts={fetchPosts}
          fetchActiveMuas={fetchActiveMuas}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          resetPagination={() => {
            setCurrentPage(1);
            setHasMorePosts(true);
          }}
        />
        <div className="flex-1 w-full max-w-2xl mx-auto my-4">
          {renderCenter()}
        </div>
        <RightSidebar
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          currentUser={currentUser}
          events={events}
          onConversationClick={(conversation) => {
            // Find the other user in the conversation
            const otherUser = conversation.participants.find(
              (p: any) => p._id !== currentUser?._id
            );

            if (otherUser) {
              // Check if chat is already open
              const isChatOpen = activeChats.some(
                chat => chat.conversation._id === conversation._id
              );

              if (!isChatOpen) {
                setActiveChats(prev => [
                  ...prev,
                  { conversation, user: otherUser }
                ]);
              }
            }
          }}
        />
      </div>

      {/* Mini Chat System */}
      <div className="fixed bottom-0 right-0 flex flex-row-reverse items-end gap-2 p-4 z-50">

        {/* 👉 Mini chat boxes (lùi sang trái để không che avatar) */}
        {activeChats.map((chat, index) => (
          <MiniChatBox
            key={chat.conversation._id}
            isOpen={true}
            onClose={() => {
              // Khi đóng => chuyển sang danh sách thu nhỏ (chỉ 1 entry duy nhất)
              setActiveChats((prev) =>
                prev.filter((c) => c.conversation._id !== chat.conversation._id)
              );

              // Nếu đã có trong minimized => không thêm nữa
              // Only add to minimized if it's not a temporary convo without messages
              const isTemp = !!chat.conversation?._isTemp;
              const hasMessages = !!chat.conversation?.lastMessage;
              if (!isTemp || hasMessages) {
                setMinimizedChats((prev) => {
                  const exists = prev.some((c) => c.conversation._id === chat.conversation._id);
                  return exists ? prev : [...prev, chat];
                });
              }
            }}
            recipientUserId={chat.user._id}
            currentUser={currentUser}
            position={{
              bottom: 20,
              right: 100 + index * 340, // 👉 đẩy qua trái để chừa khoảng 100px cho cột avatar
            }}
          />
        ))}

        {/* 👉 Cột avatar thu nhỏ bên phải ngoài cùng */}
        <div className="flex flex-col items-center gap-3 mr-2">
          {minimizedChats.map((chat) => (
            <div
              key={chat.conversation._id}
              className="relative group cursor-pointer"
            >
              <img
                src={chat.user.avatarUrl || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'}
                alt={chat.user.fullName}
                title={chat.user.fullName}
                onClick={() => {
                  // Chỉ mở lại nếu chưa có và chưa vượt quá giới hạn 5
                  const isAlreadyOpen = activeChats.some(
                    (c) => c.conversation._id === chat.conversation._id
                  );

                  if (isAlreadyOpen) return;
                  if (activeChats.length >= 5) {
                    toast.warning("You can only have up to 5 active chat boxes.");
                    return;
                  }

                  // Mở lại chat và loại khỏi danh sách thu nhỏ
                  setMinimizedChats((prev) =>
                    prev.filter((c) => c.conversation._id !== chat.conversation._id)
                  );
                  setActiveChats((prev) => [...prev, chat]);
                }}
                className="w-12 h-12 rounded-full object-cover border-2 border-rose-400 shadow-md hover:scale-110 transition-transform"
              />

              {/* Nút X nhỏ để đóng hẳn */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimizedChats((prev) =>
                    prev.filter((c) => c.conversation._id !== chat.conversation._id)
                  );
                }}
                className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
