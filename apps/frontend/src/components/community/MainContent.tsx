'use client';
import React, { useState, useEffect, useCallback } from 'react';
import LeftSidebar from './LeftSidebar';
import StoriesSection from './StoriesSection';
import PostCreator from './PostCreator';
import PostsFeed from './PostsFeed';
import RightSidebar from './RightSidebar';

import type { Story, Conversation, Event, Page } from './community.types';
import { mockUser, mockStories, mockConversations, mockEvents, mockPages } from './data/mockCommunityData';
import { CommunityService } from '@/services/community';
import { PostResponseDTO } from '@/types/community.dtos';
import type { UserResponseDTO } from '@/types/user.dtos';

export type MinimalUser = { fullName: string; _id?: string };
export default function MainContent() {
  const [postText, setPostText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Primary');
  const [posts, setPosts] = useState<PostResponseDTO[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  useEffect(() => {
    // Hydrate current user from localStorage (DTO)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('currentUser');
        if (raw) {
          const parsed = JSON.parse(raw) as UserResponseDTO;
          setCurrentUser(parsed);
        } else {
          // fallback for unauthenticated or missing storage
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    }

    // Mock side data
    setStories(mockStories);
    setConversations(mockConversations);
    setEvents(mockEvents);
    setPages(mockPages);
  }, []);

  const fetchPosts = useCallback(async () => {
    const res = await CommunityService.listPosts({ page: 1, limit: 10 });
    if (res.success && res.data) {
      let items = res.data.items;
      // Initialize liked flags for current user on first load
      try {
        if (currentUser && items.length) {
          const likedRes = await CommunityService.getMyLikedPosts(items.map(p => p._id));
          if (likedRes.success && likedRes.data) {
            const likedSet = new Set(likedRes.data);
            items = items.map(p => ({ ...(p as any), _isLiked: likedSet.has(p._id) }));
          }
        }
      } catch {
        // ignore if unauthenticated or endpoint fails
      }
      setPosts(items);
      console.log('Fetched posts:', items);
    }
  }, [currentUser]);

  useEffect(() => {
    // Fetch posts whenever currentUser changes (including first mount),
    // so _isLiked can be hydrated once the user is known.
    fetchPosts();
  }, [fetchPosts]);

  // Minimal user shape for community components that only need display name (and optionally _id)
  const minimalUser = currentUser ? ({ fullName: currentUser.fullName, _id: currentUser._id } as any) : ({ fullName: '' } as any);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex">
        <LeftSidebar currentUser={(currentUser as any) ?? (mockUser as any)} pages={pages} />
        <div className="flex-1 max-w-2xl mx-auto p-6">
          <StoriesSection stories={stories} currentUser={(currentUser as any) ?? (mockUser as any)} />
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
        </div>
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
