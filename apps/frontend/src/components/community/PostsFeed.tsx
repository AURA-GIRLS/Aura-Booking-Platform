import { Heart, MessageCircle, Share, MoreHorizontal, Check } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import type { CommentResponseDTO, PostResponseDTO } from '@/types/community.dtos';
import { CommunityService } from '@/services/community';
import { TARGET_TYPES, USER_ROLES, POST_STATUS, RESOURCE_TYPES } from '../../constants';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/lib/ui/dropdown-menu';
import { MinimalUser } from './MainContent';
import EditPostModal from './modals/EditPostModal';
import ImageLightbox from './modals/ImageLightbox';
import { socket } from '@/config/socket';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../lib/ui/tooltip';
import { Badge } from '@/components/lib/ui/badge';
import DetailModal from './modals/DetailModal';


export default function PostsFeed({ posts, setPosts, currentUser: _currentUser }: Readonly<{ posts: PostResponseDTO[]; setPosts: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>; currentUser: MinimalUser }>) {
  type UIComment = CommentResponseDTO & { isLiked?: boolean; likeCount: number };
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, UIComment[]>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<(PostResponseDTO & { _isLiked?: boolean }) | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activePost, setActivePost] = useState<PostResponseDTO | null>(null);

  const formatTimeAgo = (date: string | Date) => {
    const d = new Date(date);
    const diffInHours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return d.toLocaleDateString();
  };

  const handleLikePost = async (postId: string) => {
    // naive toggle with backend request
    const post = posts.find(p => p._id === postId);
    if (!post) return;
    const isLikedLocally = (post as any)._isLiked === true;
    try {
      if (isLikedLocally) {
        await CommunityService.unlike({ targetType: TARGET_TYPES.POST, postId });
        setPosts((prev) => prev.map((p) => (p._id === postId ? ({ ...p, likesCount: Math.max(0, (p.likesCount || 0) - 1), _isLiked: false } as PostResponseDTO & { _isLiked?: boolean }) : p)));
      } else {
        await CommunityService.like({ targetType: TARGET_TYPES.POST, postId });
        setPosts((prev) => prev.map((p) => (p._id === postId ? ({ ...p, likesCount: (p.likesCount || 0) + 1, _isLiked: true } as PostResponseDTO & { _isLiked?: boolean }) : p)));
      }
    } catch {
      // optional: toast error
    }
  };

  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const isSelfUser = useCallback((id?: string) => {
    const me = ((_currentUser as any)?._id) ?? undefined;
    return !!(id && me && id === me);
  }, [_currentUser]);

  // Helpers to update posts list with minimal nesting
  const updateOnePost = useCallback((list: (PostResponseDTO & { _isLiked?: boolean })[], id: string, builder: (p: PostResponseDTO & { _isLiked?: boolean }) => PostResponseDTO & { _isLiked?: boolean }) => {
    const idx = list.findIndex((p) => p._id === id);
    if (idx === -1) return list;
    const next = list.slice();
    next[idx] = builder(next[idx] as any);
    return next;
  }, []);

  const applyLikeIncrement = useCallback((list: (PostResponseDTO & { _isLiked?: boolean })[], postId: string, isSelf: boolean) =>
    updateOnePost(list, postId, (p) => ({ ...(p as any), likesCount: (p.likesCount || 0) + 1, _isLiked: isSelf ? true : (p as any)._isLiked })), [updateOnePost]);

  const applyLikeDecrement = useCallback((list: (PostResponseDTO & { _isLiked?: boolean })[], postId: string, isSelf: boolean) =>
    updateOnePost(list, postId, (p) => ({ ...(p as any), likesCount: Math.max(0, (p.likesCount || 0) - 1), _isLiked: isSelf ? false : (p as any)._isLiked })), [updateOnePost]);

  const applyPostUpdated = useCallback((list: (PostResponseDTO & { _isLiked?: boolean })[], payload: PostResponseDTO) =>
    updateOnePost(list, payload._id, (p) => ({ ...(payload as any), _isLiked: (p as any)._isLiked })), [updateOnePost]);

  // Helper to update a single comment's like state by commentId across posts
  const applyCommentLikeDelta = useCallback((state: Record<string, UIComment[]>, commentId: string, delta: 1 | -1, isSelf: boolean) => {
    // find the post containing this comment
    let foundPostId: string | null = null;
    for (const pid of Object.keys(state)) {
      const list = state[pid] || [];
      if (list.some((c) => c._id === commentId)) { foundPostId = pid; break; }
    }
    if (!foundPostId) return state;
    const list = state[foundPostId] || [];
    const idx = list.findIndex((c) => c._id === commentId);
    if (idx === -1) return state;
    const nextList = list.slice();
    const c = nextList[idx];
    nextList[idx] = { ...c, likeCount: Math.max(0, (c.likeCount || 0) + delta), isLiked: isSelf ? (delta > 0) : c.isLiked };
    return { ...state, [foundPostId]: nextList };
  }, []);

  useEffect(() => {
    const onPostLiked = (payload: { postId: string; userId: string }) => {
      const isSelf = isSelfUser(payload.userId);
      setPosts(prev => applyLikeIncrement(prev as any, payload.postId, isSelf) as any);
    };
    const onPostUnliked = (payload: { postId: string; userId: string }) => {
      const isSelf = isSelfUser(payload.userId);
      setPosts(prev => applyLikeDecrement(prev as any, payload.postId, isSelf) as any);
    };
    const onPostUpdated = (payload: PostResponseDTO) => {
      setPosts(prev => applyPostUpdated(prev as any, payload) as any);
    };

    const onCommentLiked = (payload: { commentId: string; userId: string }) => {
      const isSelf = isSelfUser(payload.userId);
      setCommentsByPost((prev) => applyCommentLikeDelta(prev, payload.commentId, 1, isSelf));
    };
    const onCommentUnliked = (payload: { commentId: string; userId: string }) => {
      const isSelf = isSelfUser(payload.userId);
      setCommentsByPost((prev) => applyCommentLikeDelta(prev, payload.commentId, -1, isSelf));
    };

    socket.on('postLiked', onPostLiked as any);
    socket.on('postUnliked', onPostUnliked as any);
    socket.on('postUpdated', onPostUpdated as any);
    socket.on('commentLiked', onCommentLiked as any);
    socket.on('commentUnliked', onCommentUnliked as any);
    return () => {
      socket.off('postLiked', onPostLiked as any);
      socket.off('postUnliked', onPostUnliked as any);
      socket.off('postUpdated', onPostUpdated as any);
      socket.off('commentLiked', onCommentLiked as any);
      socket.off('commentUnliked', onCommentUnliked as any);
    };
  }, [setPosts, _currentUser]);

  const openEditModal = (post: PostResponseDTO & { _isLiked?: boolean }) => {
    setEditingPost(post);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingPost(null);
  };

  // Save handled inside EditPostModal now
  const handleLikeComment = async (postId: string, commentId: string) => {
    const list = commentsByPost[postId] || [];
    const idx = list.findIndex(c => c._id === commentId);
    if (idx === -1) return;
    const isLiked = !!list[idx].isLiked;
    try {
      if (isLiked) {
        await CommunityService.unlike({ targetType: TARGET_TYPES.COMMENT, commentId });
        setCommentsByPost(prev => {
          const l = prev[postId] || [];
          const n = l.slice();
          const c = n[idx];
          n[idx] = { ...c, likeCount: Math.max(0, (c.likeCount || 0) - 1), isLiked: false };
          return { ...prev, [postId]: n };
        });
      } else {
        await CommunityService.like({ targetType: TARGET_TYPES.COMMENT, commentId });
        setCommentsByPost(prev => {
          const l = prev[postId] || [];
          const n = l.slice();
          const c = n[idx];
          n[idx] = { ...c, likeCount: (c.likeCount || 0) + 1, isLiked: true };
          return { ...prev, [postId]: n };
        });
      }
    } catch {
      // optionally toast error
    }
  };

  // Render images with specific layout rules
  const openLightbox = useCallback((images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  function renderImages(images: string[], postId: string) {
    const count = images.length;
    if (count === 0) return null;
    if (count === 1) {
      return (
        <div className="mb-4 rounded-xl overflow-hidden">
          <button
            type="button"
            className="w-full h-96"
            aria-label="Open media 1"
            onClick={() => openLightbox(images, 0)}
          >
            <img src={images[0]} alt={`Post media 1`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </button>
        </div>
      );
    }
    if (count === 2) {
      return (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <div key={`${postId}-${i}`} className="rounded-xl overflow-hidden h-64">
              <button
                type="button"
                className="w-full h-full"
                aria-label={`Open media ${i + 1}`}
                onClick={() => openLightbox(images, i)}
              >
                <img src={img} alt={`Post media ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </button>
            </div>
          ))}
        </div>
      );
    }
    if (count === 3) {
      return (
        <div className="mb-4 grid grid-cols-2 grid-rows-2 gap-2 h-96">
          {/* Left big image spans 2 rows */}
          <div className="row-span-2 rounded-xl overflow-hidden">
            <button type="button" className="w-full h-full" aria-label="Open media 1" onClick={() => openLightbox(images, 0)}>
              <img src={images[0]} alt={`Post media 1`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          </div>
          {/* Right column two stacked images */}
          <div className="rounded-xl overflow-hidden">
            <button type="button" className="w-full h-full" aria-label="Open media 2" onClick={() => openLightbox(images, 1)}>
              <img src={images[1]} alt={`Post media 2`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          </div>
          <div className="rounded-xl overflow-hidden">
            <button type="button" className="w-full h-full" aria-label="Open media 3" onClick={() => openLightbox(images, 2)}>
              <img src={images[2]} alt={`Post media 3`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          </div>
        </div>
      );
    }
    // 4 or more
    const firstFour = images.slice(0, 4);
    const remaining = count - 4;
    return (
      <div className="mb-4 grid grid-cols-2 gap-2">
        {firstFour.map((img, i) => {
          const isLast = i === 3;
          return (
            <div key={`${postId}-${i}`} className="relative rounded-xl overflow-hidden h-48">
              <button type="button" className="w-full h-full" aria-label={`Open media ${i + 1}`} onClick={() => openLightbox(images, i)}>
                <img src={img} alt={`Post media ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </button>
              {isLast && remaining > 0 && (
                <button aria-label={`Open gallery with ${count} images`} onClick={() => openLightbox(images, i)} className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">+{remaining}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  const loadComments = async (postId: string) => {
    // Nếu đã load trước đó thì skip
    if (commentsByPost[postId]) return;
    try {
      const res = await CommunityService.listCommentsByPost(postId, { page: 1, limit: 10 });
      if (res.success && res.data) {
        const items = res.data.items || [];

        // Try to hydrate which comments the current user has liked
        let likedIds: string[] = [];
        const ids = items.map((c) => c._id).filter(Boolean);
        if (ids.length) {
          try {
            const likedRes = await CommunityService.getMyLikedComments(ids);
            if ((likedRes as any)?.success && Array.isArray(likedRes.data)) {
              likedIds = likedRes.data;
            }
          } catch {
            // Not logged in or request failed; proceed without hydration
          }
        }

        const uiComments: UIComment[] = items.map((c) => ({
          ...c,
          likeCount: (c as any).likeCount ?? (c as any).likesCount ?? 0,
          isLiked: likedIds.includes(c._id),
        }));
        setCommentsByPost((prev) => ({ ...prev, [postId]: uiComments }));
      }
    } catch (e) {
      console.error("Failed to load comments", e);
    }
  };

  // Auto-load comments when a post's comments are expanded for the first time
  useEffect(() => {
    const toLoad = Object.keys(expandedComments).filter(
      (pid) => expandedComments[pid] && !commentsByPost[pid]
    );
    toLoad.forEach((pid) => {
      void loadComments(pid);
    });
  }, [expandedComments, commentsByPost]);

  return (
    <>
      <div className="space-y-6">
        {posts
          .filter((p) => p.status !== POST_STATUS.PRIVATE)
          .map((post) => {
            const imageUrls = Array.isArray((post as any).media)
              ? ((post as any).media as any[])
                  .filter((m) => m && m.type === RESOURCE_TYPES.image && typeof m.url === 'string' && m.url)
                  .map((m) => m.url as string)
              : [];
            return (
            <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{post.authorName ? getInitials(post.authorName) : ''}</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <span>{post.authorName}</span>
                        {post.authorRole && post.authorRole.toUpperCase() === USER_ROLES.ARTIST && (
                          <span className="relative group ml-1 cursor-pointer">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="inline-flex items-center justify-center rounded-full bg-rose-600 p-[0.2rem]"
                                    aria-describedby={`artist-tip-${post._id}`}
                                  >
                                    <Check className="w-3 h-3 text-white font-semibold" aria-hidden="true" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 text-white text-xs">
                                  <p>Verified Artist badge</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt as any)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        title="Post actions"
                        className="border-none p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                      <DropdownMenuItem
                        className='cursor-pointer focus:bg-rose-100 data-[highlighted]:bg-rose-100'
                        onClick={() => { alert('Feature coming soon: view details'); }}>
                        View details
                      </DropdownMenuItem>
                      {(post.authorId === (_currentUser as any)._id) && (
                        <DropdownMenuItem
                          className='cursor-pointer focus:bg-rose-100 data-[highlighted]:bg-rose-100'
                          onClick={() => openEditModal(post as any)}>
                          Edit post
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className='cursor-pointer focus:bg-rose-100 data-[highlighted]:bg-rose-100'
                        onClick={() => {
                          const url = `${window.location.origin}/user/community?post=${post._id}`;
                          void navigator.clipboard?.writeText(url).catch(() => { });
                        }}
                      >
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-rose-600 cursor-pointer focus:bg-rose-100 focus:text-rose-700 data-[highlighted]:bg-rose-100">
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-2">
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                </div>
                {Array.isArray((post as any).tags) && (post as any).tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(post as any).tags.map((t: string) => (
                      <Badge key={`${post._id}-${t}`} variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-default">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}
                {imageUrls.length ? renderImages(imageUrls, post._id) : null}

                <div className="flex items-center space-x-6 text-gray-500">
                  <button onClick={() => handleLikePost(post._id)} className={`flex items-center space-x-2 ${(post as any)._isLiked ? 'text-rose-600' : 'hover:text-rose-600'}`}>
                    <Heart className={`w-5 h-5 ${(post as any)._isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likesCount || 0} Likes</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePost(post);
                      setCommentsOpen(true);
                      void loadComments(post._id);
                    }}
                    className="flex items-center space-x-2 hover:text-rose-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.commentsCount || 0} Comments</span>
                  </button>

                  <button className="flex items-center space-x-2 hover:text-rose-600">
                    <Share className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
            );
          })}
      </div>
      <EditPostModal
        isOpen={isEditOpen}
        post={editingPost}
        onClose={closeEditModal}
        onUpdated={(updated) => {
          setPosts((prev) => prev.map((p) => (p._id === updated._id ? ({ ...(updated as any), _isLiked: (p as any)._isLiked }) : p)));
        }}
      />
      <ImageLightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
      <DetailModal
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        post={activePost}
        comments={activePost ? (commentsByPost[activePost._id] || []) : []}
        commentInput={activePost ? (commentInputs[activePost._id] || "") : ""}
        onCommentInputChange={(val) =>
          activePost && setCommentInputs((prev) => ({ ...prev, [activePost._id]: val }))
        }
        onAddComment={() => activePost && handleAddComment(activePost._id)}
        onLikeComment={(commentId) =>
          activePost && handleLikeComment(activePost._id, commentId)
        }
        getInitials={getInitials}
        formatTimeAgo={formatTimeAgo}
        isSelfUser={isSelfUser}
        _currentUser={_currentUser}
      />

    </>
  );
}
