import { Heart, MessageCircle, Share, MoreHorizontal, Check, Globe, Lock, Earth } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import type { CommentResponseDTO, PostResponseDTO, UserWallResponseDTO } from '@/types/community.dtos';
import { CommunityService } from '@/services/community';
import { TARGET_TYPES, USER_ROLES, POST_STATUS, RESOURCE_TYPES } from '../../constants';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/lib/ui/dropdown-menu';
import EditPostModal from './modals/EditPostModal';
import ImageLightbox from './modals/ImageLightbox';
import { socket } from '@/config/socket';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../lib/ui/tooltip';
import { Badge } from '@/components/lib/ui/badge';
import DetailModal from './modals/DetailModal';
import { Separator } from '../lib/ui/separator';


export default function PostsFeed({ posts, setPosts, currentUser: _currentUser, fetchMinimalUser, onOpenUserWall }: Readonly<{ posts: PostResponseDTO[]; setPosts: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>; currentUser: UserWallResponseDTO; fetchMinimalUser: () => Promise<void>; onOpenUserWall?: (userId: string, userName?: string) => void }>) {
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
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

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
    // Only call API; socket events will update UI
    const post = posts.find(p => p._id === postId);
    if (!post) return;
    const isLikedLocally = (post as any)._isLiked === true;
    try {
      if (isLikedLocally) {
        await CommunityService.unlike({ targetType: TARGET_TYPES.POST, postId });
      } else {
        await CommunityService.like({ targetType: TARGET_TYPES.POST, postId });
      }
    } catch {
      // optional: toast error
    }
  };


  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const isSelfUser = useCallback((id?: string) => {
    const me = ((_currentUser as any)?._id) ?? undefined;
    return !!(id && me && id === me);
  }, [_currentUser]);

  const toggleFollow = useCallback(async (authorId: string) => {
    const me = (_currentUser as any)?._id as string | undefined;
    if (!authorId || (me && authorId === me)) return;
    setFollowLoading((prev) => ({ ...prev, [authorId]: true }));
    try {
      const isFollowing = !!following[authorId];
      if (isFollowing) await CommunityService.unfollowUser(authorId);
      else await CommunityService.followUser(authorId);
    } catch (e) {
      // optional: toast error; revert optimistic state if needed
      console.error('Failed to toggle follow', e);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [authorId]: false }));
    }
  }, [_currentUser, following]);

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

  // Socket event handlers (extracted to reduce nesting depth)
  const handleSocketPostLiked = useCallback((payload: { postId: string; userId: string }) => {
    const isSelf = isSelfUser(payload.userId);
    console.log('Received postLiked for', payload.postId, 'by user', payload.userId, 'isSelf:', isSelf);
    setPosts((prev) => applyLikeIncrement(prev as any, payload.postId, isSelf) as any);
  }, [isSelfUser, setPosts, applyLikeIncrement]);

  const handleSocketPostUnliked = useCallback((payload: { postId: string; userId: string }) => {
    const isSelf = isSelfUser(payload.userId);
    setPosts((prev) => applyLikeDecrement(prev as any, payload.postId, isSelf) as any);
  }, [isSelfUser, setPosts, applyLikeDecrement]);

  const handleSocketPostUpdated = useCallback((payload: PostResponseDTO) => {
    setPosts((prev) => applyPostUpdated(prev as any, payload) as any);
  }, [setPosts, applyPostUpdated]);

  const removePostFromList = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, [setPosts]);

  const clearCommentsStateForPost = useCallback((postId: string) => {
    setCommentsByPost((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  }, []);

  const clearExpandedForPost = useCallback((postId: string) => {
    setExpandedComments((prev) => {
      const next = { ...prev } as any;
      if (postId in next) delete next[postId];
      return next;
    });
  }, []);

  const clearInputForPost = useCallback((postId: string) => {
    setCommentInputs((prev) => {
      const next = { ...prev } as any;
      if (postId in next) delete next[postId];
      return next;
    });
  }, []);

  const closeActiveIfMatches = useCallback((postId: string) => {
    setActivePost((curr) => (curr && curr._id === postId ? null : curr));
    setCommentsOpen((open) => (activePost && activePost._id === postId ? false : open));
  }, [activePost]);

  const handleSocketPostDeleted = useCallback(async (payload: { postId: string }) => {
    console.log('Received postDeleted for', payload.postId);
    const meId = (_currentUser as any)?._id as string | undefined;
    const wasMine = !!(meId && posts.some((p) => p._id === payload.postId && p.authorId === meId));
    removePostFromList(payload.postId);
    clearCommentsStateForPost(payload.postId);
    clearExpandedForPost(payload.postId);
    clearInputForPost(payload.postId);
    closeActiveIfMatches(payload.postId);
    if (isEditOpen && editingPost && editingPost._id === payload.postId) {
      setIsEditOpen(false);
      setEditingPost(null);
    }
    if (wasMine) {
      await fetchMinimalUser?.();
    }
  }, [removePostFromList, clearCommentsStateForPost, clearExpandedForPost, clearInputForPost, closeActiveIfMatches, isEditOpen, editingPost, posts, _currentUser, fetchMinimalUser]);

  const handleSocketCommentLiked = useCallback((payload: { commentId: string; userId: string }) => {
    const isSelf = isSelfUser(payload.userId);
    setCommentsByPost((prev) => applyCommentLikeDelta(prev, payload.commentId, 1, isSelf));
  }, [isSelfUser, setCommentsByPost, applyCommentLikeDelta]);

  const handleSocketCommentUnliked = useCallback((payload: { commentId: string; userId: string }) => {
    const isSelf = isSelfUser(payload.userId);
    setCommentsByPost((prev) => applyCommentLikeDelta(prev, payload.commentId, -1, isSelf));
  }, [isSelfUser, setCommentsByPost, applyCommentLikeDelta]);

  const handleSocketUserFollowed = useCallback(async (payload: { followerId: string; followingId: string }) => {
    const meId = (_currentUser as any)?._id as string | undefined;
    const iAmFollower = !!(meId && payload.followerId === meId);
    const iAmFollowed = !!(meId && payload.followingId === meId);
    if (iAmFollower) {
      setFollowing((prev) => ({ ...prev, [payload.followingId]: true }));
    }
    if (iAmFollower || iAmFollowed) {
      await fetchMinimalUser?.();
    }
  }, [setFollowing, _currentUser, fetchMinimalUser]);

  const handleSocketUserUnfollowed = useCallback(async (payload: { followerId: string; followingId: string }) => {
    const meId = (_currentUser as any)?._id as string | undefined;
    const iAmFollower = !!(meId && payload.followerId === meId);
    const iAmFollowed = !!(meId && payload.followingId === meId);
    if (iAmFollower) {
      setFollowing((prev) => ({ ...prev, [payload.followingId]: false }));
    }
    if (iAmFollower || iAmFollowed) {
      await fetchMinimalUser?.();
    }
  }, [setFollowing, _currentUser, fetchMinimalUser]);

  useEffect(() => {
    // hydrate following for current user
    const me = (_currentUser as any)?._id as string | undefined;
    if (me) {
      void (async () => {
        try {
          const res = await CommunityService.getFollowing(me);
          if ((res as any)?.success && Array.isArray(res.data)) {
            const map: Record<string, boolean> = {};
            for (const uid of res.data) map[uid] = true;
            setFollowing(map);
          }
        } catch {
          // ignore
        }
      })();
    }

    socket.on('postLiked', handleSocketPostLiked as any);
    socket.on('postUnliked', handleSocketPostUnliked as any);
    socket.on('postUpdated', handleSocketPostUpdated as any);
    socket.on('postDeleted', handleSocketPostDeleted as any);
    socket.on('commentLiked', handleSocketCommentLiked as any);
    socket.on('commentUnliked', handleSocketCommentUnliked as any);
    socket.on('userFollowed', handleSocketUserFollowed as any);
    socket.on('userUnfollowed', handleSocketUserUnfollowed as any);
    return () => {
      socket.off('postLiked', handleSocketPostLiked as any);
      socket.off('postUnliked', handleSocketPostUnliked as any);
      socket.off('postUpdated', handleSocketPostUpdated as any);
      socket.off('postDeleted', handleSocketPostDeleted as any);
      socket.off('commentLiked', handleSocketCommentLiked as any);
      socket.off('commentUnliked', handleSocketCommentUnliked as any);
      socket.off('userFollowed', handleSocketUserFollowed as any);
      socket.off('userUnfollowed', handleSocketUserUnfollowed as any);
    };
  }, [
    _currentUser,
    handleSocketPostLiked,
    handleSocketPostUnliked,
    handleSocketPostUpdated,
    handleSocketPostDeleted,
    handleSocketCommentLiked,
    handleSocketCommentUnliked,
    handleSocketUserFollowed,
    handleSocketUserUnfollowed,
  ]);

  const openEditModal = (post: PostResponseDTO & { _isLiked?: boolean }) => {
    setEditingPost(post);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingPost(null);
  };

  // Save handled inside EditPostModal now
  const handleLikeComment = async (_postId: string, commentId: string) => {
    // Only call API; socket events will update UI
    const list = commentsByPost[_postId] || [];
    const idx = list.findIndex(c => c._id === commentId);
    if (idx === -1) return;
    const isLiked = !!list[idx].isLiked;
    try {
      if (isLiked) {
        await CommunityService.unlike({ targetType: TARGET_TYPES.COMMENT, commentId });
      } else {
        await CommunityService.like({ targetType: TARGET_TYPES.COMMENT, commentId });
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
          
          .map((post) => {
            const imageUrls = Array.isArray((post as any).media)
              ? ((post as any).media as any[])
                  .filter((m) => m && m.type === RESOURCE_TYPES.image && typeof m.url === 'string' && m.url)
                  .map((m) => m.url as string)
              : [];
            return (
            <div id={`post-${post._id}`} key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden  hover:shadow-md">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                  {post.authorAvatarUrl ? (
                    <img
                      src={post.authorAvatarUrl}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(post.authorName)}</span>
                    </div>
                  )}
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <button
                          type="button"
                          onClick={() => onOpenUserWall?.(post.authorId, post.authorName)}
                          className="text-gray-900 hover:underline"
                        >
                          {post.authorName}
                        </button>
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
                        {post.authorId !== (_currentUser as any)._id && (
                          <button
                            type="button"
                            onClick={() => toggleFollow(post.authorId)}
                            disabled={!!followLoading[post.authorId]}
                            className={
                              `ml-2 text-xs px-2 py-[1px] my-0 shadow-xs rounded-md border cursor-pointer ` +
                              (following[post.authorId]
                                ? `border-rose-200 text-white bg-rose-600 hover:bg-rose-700`
                                : `border-gray-300`)
                            }
                          >
                             {following[post.authorId]
                                ? `Following`
                                : `Follow`}
                          </button>
                        )}
                      </h4>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{formatTimeAgo(post.createdAt as any)}</span>
                        <span aria-hidden="true" className="inline-block w-1 h-1 rounded-full bg-gray-400" />
                        {post.status === POST_STATUS.PRIVATE ? (
                          <Lock className="w-3 h-3 text-gray-600" aria-label="Private" />
                        ) : (
                          <Earth className="w-3 h-3 text-gray-600" aria-label="Public" />
                        )}
                      </div>
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
                        className="cursor-pointer focus:bg-rose-100 data-[highlighted]:bg-rose-100"
                        onClick={() => {
                          setActivePost(post);
                          setCommentsOpen(true);
                          void loadComments(post._id);
                        }}
                      >
                        View details
                      </DropdownMenuItem>
                      {post.authorId === (_currentUser as any)._id && (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer focus:bg-rose-100 data-[highlighted]:bg-rose-100"
                            onClick={() => openEditModal(post as any)}
                          >
                            Edit post
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-600 cursor-pointer focus:bg-rose-100 focus:text-rose-700 data-[highlighted]:bg-rose-100"
                            onClick={async () => {
                              try {
                                await CommunityService.deletePost(post._id);
                                // The list will be updated by realtime 'postDeleted' event
                              } catch (e) {
                                console.error('Failed to delete post', e);
                              }
                            }}
                          >
                            Delete post
                          </DropdownMenuItem>
                          <Separator className="h-[1px] bg-gray-200 dark:bg-gray-300 opacity-100" />
                        </>
                      )}
                      <DropdownMenuItem
                        className="cursor-pointer focus:bg-rose-100 data-[highlighted]:bg-rose-100"
                        onClick={() => {
                          const url = `${window.location.origin}/user/community?post=${post._id}`;
                          void navigator.clipboard?.writeText(url).catch(() => {});
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
        getInitials={getInitials}
        formatTimeAgo={formatTimeAgo}
        isSelfUser={isSelfUser}
        _currentUser={_currentUser}
      />

    </>
  );
}
