'use client'
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Image, Hash, AtSign, Users, Calendar, Search, Send, VideoIcon, Plus } from 'lucide-react';
import { Post, Story, User, Conversation, Event, Page } from './community.types';
import { mockUser, mockPosts, mockStories, mockConversations, mockEvents, mockPages } from './data/mockCommunityData';

export default function MainContent() {
  const [postText, setPostText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Primary');
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(mockUser);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  // Temporary comment types/state for in-memory interactions
  type TempComment = {
    id: string;
    user: User;
    content: string;
    createdAt: Date;
    isLiked: boolean;
    likeCount: number;
  };
  const [commentsByPost, setCommentsByPost] = useState<Record<string, TempComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load mock data
    setPosts(mockPosts);
    setStories(mockStories);
    setConversations(mockConversations);
    setEvents(mockEvents);
    setPages(mockPages);
  }, []);

  // Override current user's display name from localStorage if available
  useEffect(() => {
    try {
      // Prefer a serialized currentUser object with fullName
      const rawUser = localStorage.getItem('currentUser');
      let nameFromStorage: string | null = null;
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          if (parsed && typeof parsed.fullName === 'string' && parsed.fullName.trim()) {
            nameFromStorage = parsed.fullName.trim();
          }
        } catch {
          // ignore malformed JSON
        }
      }

      // Fallback to a simple string key if provided
      if (!nameFromStorage) {
        const rawName = localStorage.getItem('currentUserFullName');
        if (rawName && rawName.trim()) {
          nameFromStorage = rawName.trim();
        }
      }

      if (nameFromStorage) {
        setCurrentUser(prev => ({ ...prev, fullName: nameFromStorage as string }));
      }
    } catch {
      // localStorage not accessible or other error; ignore
    }
  }, []);

  const handleCreatePost = () => {
    if (!postText.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUser.id,
      user: currentUser,
      content: postText,
      createdAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isLiked: false,
      privacy
    };

    setPosts([newPost, ...posts]);
    setPostText('');
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 }
        : post
    ));
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    const newComment: TempComment = {
      id: `${postId}-${Date.now()}`,
      user: currentUser,
      content: text,
      createdAt: new Date(),
      isLiked: false,
      likeCount: 0,
    };
    setCommentsByPost(prev => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])],
    }));
    // bump comment count on the post
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
    // clear input
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    // ensure expanded
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setCommentsByPost(prev => {
      const list = prev[postId] || [];
      const updated = list.map(c => c.id === commentId ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 } : c);
      return { ...prev, [postId]: updated };
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white h-screen sticky top-0 border-r border-gray-200 p-4">
          {/* Profile Section */}
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{getInitials(currentUser.fullName)}</span>
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{currentUser.fullName}</h3>
              <p className="text-sm text-gray-500">@{currentUser.username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between mb-6 text-center">
            <div>
              <div className="font-semibold text-gray-900">{currentUser.followerCount >= 1000 ? `${(currentUser.followerCount / 1000).toFixed(1)}k` : currentUser.followerCount}</div>
              <div className="text-xs text-gray-500">Follower</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{currentUser.followingCount}</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{currentUser.postCount}</div>
              <div className="text-xs text-gray-500">Post</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button type="button" aria-label="Go to feed" className="flex items-center w-full text-left px-3 py-2 text-white bg-rose-600 rounded-lg">
              <Users className="w-5 h-5 mr-3" />
              Feed
            </button>
            <button type="button" aria-label="Go to friends" className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
              <Users className="w-5 h-5 mr-3" />
              Friends
            </button>
            <button type="button" aria-label="Go to events" className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 mr-3" />
              Event
              <span className="ml-auto bg-rose-600 text-white text-xs rounded-full px-2 py-1">5</span>
            </button>
            <button type="button" aria-label="Watch videos" className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
              <VideoIcon className="w-5 h-5 mr-3" />
              Watch Videos
            </button>
            <button type="button" aria-label="View photos" className="flex items-center w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
              <Image className="w-5 h-5 mr-3" />
              Photos
            </button>
          </nav>

          {/* Pages You Like */}
          <div className="mt-8">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">PAGES YOU LIKE</h4>
            <div className="space-y-3">
              {pages.map((page, index) => {
                const colors = ['bg-rose-600', 'bg-rose-700', 'bg-rose-500', 'bg-black', 'bg-neutral-800'];
                return (
                  <div key={page.id} className="flex items-center">
                    <div className={`w-8 h-8 ${colors[index % colors.length]} rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{getInitials(page.name)}</span>
                    </div>
                    <span className="ml-3 text-sm text-gray-700">{page.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl mx-auto p-6">
          {/* Stories Section */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              <div className="flex-shrink-0 text-center cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full p-1 relative">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-600">Your Story</p>
              </div>
              {stories.map((story) => (
                <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
                  <div className={`w-16 h-16 rounded-full p-1 ${story.isViewed ? 'bg-gray-300' : 'bg-gradient-to-br from-rose-500 to-rose-700'}`}>
                    <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-black rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(story.user.fullName)}</span>
                    </div>
                  </div>
                  <p className="text-xs mt-1 text-gray-600">{story.user.fullName.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Post Creation */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getInitials(currentUser.fullName)}</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full border-none resize-none text-gray-700 placeholder-gray-400 focus:outline-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-4">
                    <button className="flex items-center text-gray-500 hover:text-rose-600">
                      <Image className="w-5 h-5 mr-1" />
                      <span className="text-sm">Image/Video</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-rose-600">
                      <Hash className="w-5 h-5 mr-1" />
                      <span className="text-sm">Hashtag</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-rose-600">
                      <AtSign className="w-5 h-5 mr-1" />
                      <span className="text-sm">Mention</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select 
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value as 'public' | 'friends' | 'private')}
                      aria-label="Post privacy"
                      className="text-sm text-gray-500 border-none focus:outline-none"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                      <option value="private">Only Me</option>
                    </select>
                    <button 
                      onClick={handleCreatePost}
                      disabled={!postText.trim()}
                      className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Share Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{getInitials(post.user.fullName)}</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-900">{post.user.fullName}</h4>
                        <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <button aria-label="Post options" className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">{post.content}</p>
                  </div>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className={`mb-4 ${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}>
                      {post.images.map((image, index) => {
                        let key: string;
                        if (typeof image === 'string') {
                          key = `${post.id}-${image}`;
                        } else if (image && (image as any).id) {
                          key = `${post.id}-${(image as any).id}`;
                        } else {
                          key = `${post.id}-img-${index}`;
                        }
                        return (
                        <div key={key} className="bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl h-48 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                              <Image className="w-8 h-8" />
                            </div>
                            <p className="text-sm">Image {index + 1}</p>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-500">
                    <div className="flex space-x-6">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likeCount} Like{post.likeCount !== 1 ? 's' : ''}</span>
                      </button>
                      <button onClick={() => handleToggleComments(post.id)} className="flex items-center space-x-2 hover:text-rose-600">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.commentCount} Comment{post.commentCount !== 1 ? 's' : ''}</span>
                      </button>
                      <button className="flex items-center space-x-2 hover:text-rose-600">
                        <Share className="w-5 h-5" />
                        <span className="text-sm">{post.shareCount} Share{post.shareCount !== 1 ? 's' : ''}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post.id] && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      {/* Add Comment */}
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">{getInitials(currentUser.fullName)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center border border-gray-200 rounded-lg px-3">
                            <input
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                              placeholder="Write a comment..."
                              className="flex-1 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!(commentInputs[post.id] || '').trim()}
                              aria-label="Send comment"
                              className="p-1 text-rose-600 disabled:opacity-40"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Comment List */}
                      <div className="space-y-3">
                        {(commentsByPost[post.id] || []).map((c) => (
                          <div key={c.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">{getInitials(c.user.fullName)}</span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg px-3 py-2">
                                <div className="text-sm font-medium text-gray-900">{c.user.fullName}</div>
                                <div className="text-sm text-gray-800">{c.content}</div>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span>{formatTimeAgo(c.createdAt)}</span>
                                <button onClick={() => handleLikeComment(post.id, c.id)} className={`hover:text-rose-600 ${c.isLiked ? 'text-rose-600' : ''}`}>Like • {c.likeCount}</button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!(commentsByPost[post.id] || []).length && (
                          <div className="text-sm text-gray-400">No comments yet. Be the first to comment.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Messages */}
        <div className="w-80 bg-white h-screen sticky top-0 border-l border-gray-200">
          {/* Messages Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <button aria-label="Search messages" className="text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-4">
              {['Primary', 'General', 'Requests(4)'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`text-sm font-medium pb-2 border-b-2 ${
                    selectedTab === tab
                      ? 'text-rose-600 border-rose-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => {
              const otherUser = conversation.participants.find(p => p.id !== currentUser.id);
              if (!otherUser) return null;
              
              return (
                <div key={conversation.id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(otherUser.fullName)}</span>
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-600 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{otherUser.fullName}</h4>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-rose-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conversation.lastMessage.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Events</h4>
              <button aria-label="More events options" className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{events.length} Events Invites</span>
              </div>
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="text-xs text-gray-500">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-gray-400">
                    {event.date.toLocaleDateString('en-US', { weekday: 'short' })} • {event.location}
                  </div>
                  {event.isAttending && (
                    <div className="text-rose-600 text-xs mt-1">✓ Attending</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}