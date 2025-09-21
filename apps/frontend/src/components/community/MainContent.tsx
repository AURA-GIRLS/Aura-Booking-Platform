'use client';
import React, { useState, useEffect, useCallback } from 'react';
import LeftSidebar from './LeftSidebar';
import StoriesSection from './StoriesSection';
import PostCreator from './PostCreator';
import PostsFeed from './PostsFeed';
import RightSidebar from './RightSidebar';

import type { Story, Conversation, Event } from './community.types';
import { mockUser, mockStories, mockConversations, mockEvents } from './data/mockCommunityData';
import { CommunityService } from '@/services/community';
import { PostResponseDTO, TagResponseDTO } from '@/types/community.dtos';
import type { UserResponseDTO } from '@/types/user.dtos';

export type MinimalUser = { fullName: string; _id?: string };

// Reusable filter state (can extend for tag, search, etc.)
export type FilterState =
  | { type: null }
  | { type: 'tag'; value: string }
  | { type: 'search'; value: string };

export default function MainContent() {
  const [postText, setPostText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Primary');
  const [posts, setPosts] = useState<PostResponseDTO[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [trendingTags, setTrendingTags] = useState<TagResponseDTO[]>([]);
  const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  // Active filter state (null = default feed, tag/search = filtered)
  const [activeFilter, setActiveFilter] = useState<FilterState>({ type: null });

  // Hydrate user and mock side data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('currentUser');
        setCurrentUser(raw ? (JSON.parse(raw) as UserResponseDTO) : null);
      } catch {
        setCurrentUser(null);
      }
    }
    setStories(mockStories);
    setConversations(mockConversations);
    setEvents(mockEvents);
  }, []);

  // Fetch posts with pagination
  const fetchPosts = useCallback(async () => {
    const res = await CommunityService.listPosts({ page: 1, limit: 10 });
    if (res.success && res.data) {
      let items = res.data.items;

      // Mark posts liked by current user
      try {
        if (currentUser && items.length) {
          const likedRes = await CommunityService.getMyLikedPosts(items.map((p) => p._id));
          if (likedRes.success && likedRes.data) {
            const likedSet = new Set(likedRes.data);
            items = items.map((p) => ({ ...(p as any), _isLiked: likedSet.has(p._id) }));
          }
        }
      } catch {
        // ignore errors (unauthenticated or request failed)
      }

      setPosts(items);
    }
  }, [currentUser]);

  // Fetch trending tags
  const fetchTrendingTags = useCallback(async () => {
    const res = await CommunityService.getTrendingTags(5);
    if (res.success && res.data) {
      setTrendingTags(res.data);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTrendingTags();
  }, [fetchPosts, fetchTrendingTags]);

  const minimalUser = currentUser
    ? ({ fullName: currentUser.fullName, _id: currentUser._id } as any)
    : ({ fullName: '' } as any);

  // Clear current filter and reset to default feed
  const clearFilter = () => {
    setActiveFilter({ type: null });
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left sidebar */}
        <LeftSidebar
          currentUser={(currentUser as any) ?? (mockUser as any)}
          trendingTags={trendingTags}
          posts={posts}
          setPosts={setPosts}
          fetchPosts={fetchPosts}
          activeFilter={activeFilter}  
          setActiveFilter={setActiveFilter} // pass filter setter
        />

        <div className="flex-1 max-w-2xl mx-auto p-6">
          {activeFilter.type ? (
            // 🟢 When a filter is active: show only feed + filter bar
            <>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Filtering by:</span>
                {activeFilter.type === 'tag' && (
                  <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-sm">
                    #{activeFilter.value}
                  </span>
                )}
                {activeFilter.type === 'search' && (
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm">
                    “{activeFilter.value}”
                  </span>
                )}
                <button
                  onClick={clearFilter}
                  className="ml-auto text-sm text-rose-600 hover:underline"
                >
                  Clear filter
                </button>
              </div>
              <PostsFeed posts={posts} setPosts={setPosts} currentUser={minimalUser} />
            </>
          ) : (
            // 🟢 Default mode: show stories, post creator, and feed
            <>
              <StoriesSection
                stories={stories}
                currentUser={(currentUser as any) ?? (mockUser as any)}
              />
              <PostCreator
                postText={postText}
                setPostText={setPostText}
                privacy={privacy}
                setPrivacy={setPrivacy}
                posts={posts}
                setPosts={setPosts}
                currentUser={minimalUser}
              />
              <PostsFeed posts={posts} setPosts={setPosts} currentUser={minimalUser} />
            </>
          )}
        </div>

        {/* Right sidebar */}
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
