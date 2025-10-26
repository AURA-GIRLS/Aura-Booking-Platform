"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/lib/ui/dialog";
import { Send, MoreHorizontal, Check, MessageSquare, MessageCircle } from "lucide-react";
import { USER_ROLES } from "@/constants/index";
import type { CommentResponseDTO, PostResponseDTO, UserWallResponseDTO } from "@/types/community.dtos";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/lib/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/lib/ui/dropdown-menu";
import { CommunityService } from "@/services/community";
import { socket } from "@/config/socket";
import DeleteConfirmDialog from "../../generalUI/DeleteConfirmDialog";
import { useAuthCheck } from "../../../utils/auth";

type UIComment = CommentResponseDTO & { 
    isLiked?: boolean; 
    likeCount: number;
    replies?: UIComment[];
    showReplies?: boolean;
    showReplyInput?: boolean;
};

export default function DetailModal({
    open,
    onOpenChange,
    post,
    getInitials,
    formatTimeAgo,
    isSelfUser,
    _currentUser,
    onOpenUserWall,
    onOpenMiniChat
}: Readonly<{
    open: boolean;
    onOpenChange: (val: boolean) => void;
    post: PostResponseDTO | null;
    getInitials: (name: string|undefined) => string|undefined;
    formatTimeAgo: (date: Date | string) => string;
    isSelfUser: (id?: string) => boolean;
    _currentUser: UserWallResponseDTO|null;
    onOpenUserWall?: (userId: string, userName?: string) => void;
     onOpenMiniChat?: (userId: string) => void;
}>) {
    const [comments, setComments] = React.useState<UIComment[]>([]);
    const [commentInput, setCommentInput] = React.useState("");
    const [replyInputs, setReplyInputs] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(false);
    const [likedComments, setLikedComments] = React.useState<Set<string>>(new Set());
    const [editingComment, setEditingComment] = React.useState<string | null>(null);
    const [editContent, setEditContent] = React.useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [commentToDelete, setCommentToDelete] = React.useState<string | null>(null);
    
    // Follow and chat state
    const [following, setFollowing] = React.useState<Record<string, boolean>>({});
    const [followLoading, setFollowLoading] = React.useState<Record<string, boolean>>({});

    const { checkAuthAndExecute, isAuthenticated } = useAuthCheck();

    // Follow functionality
    const handleToggleFollow = async (userId: string, isFollowing: boolean) => {
        if (!isAuthenticated) {
            console.log("Please login to follow");
            return;
        }

        setFollowLoading(prev => ({ ...prev, [userId]: true }));

        try {
            if (isFollowing) {
                await CommunityService.unfollowUser(userId);
                setFollowing(prev => ({ ...prev, [userId]: false }));
            } else {
                await CommunityService.followUser(userId);
                setFollowing(prev => ({ ...prev, [userId]: true }));
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setFollowLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Message functionality
    const handleOpenChat = (userId: string) => {
        if (!isAuthenticated) {
            console.log("Please login to message");
            return;
        }
        onOpenMiniChat?.(userId);
    };

    // User wall navigation
    const handleOpenUserWall = (userId: string) => {
        onOpenUserWall?.(userId);
    };

    // Load comments when post changes
    React.useEffect(() => {
        if (post?._id && open) {
            loadComments();
            loadLikedComments();
        }
    }, [post?._id, open]);

    // Socket listeners for realtime updates
    React.useEffect(() => {
        if (!post?._id || !open) return;

        // Listen for new comments
        const handleNewComment = (data: { postId: string; comment: CommentResponseDTO }) => {
            if (data.postId === post._id) {
                const newComment: UIComment = {
                    ...data.comment,
                    likeCount: 0,
                    isLiked: false,
                    replies: [],
                    showReplies: false,
                    showReplyInput: false,
                };
                setComments(prev => [newComment, ...prev]);
            }
        };

        // Listen for new replies
        const handleNewReply = (data: { postId: string; parentCommentId: string; reply: CommentResponseDTO }) => {
            if (data.postId === post._id) {
                const newReply: UIComment = {
                    ...data.reply,
                    likeCount: 0,
                    isLiked: false,
                };

                setComments(prev => prev.map(comment => {
                    if (comment._id === data.parentCommentId) {
                        return {
                            ...comment,
                            repliesCount: comment.repliesCount + 1,
                            replies: [...(comment.replies || []), newReply],
                            showReplies: true,
                        };
                    }
                    return comment;
                }));
            }
        };

        // Listen for comment likes/unlikes
        const handleCommentLike = (data: { commentId: string; isLiked: boolean; likeCount: number }) => {
            // Update likedComments state to track user's like status
            setLikedComments(prev => {
                const newSet = new Set(prev);
                if (data.isLiked) {
                    newSet.add(data.commentId);
                } else {
                    newSet.delete(data.commentId);
                }
                return newSet;
            });

            setComments(prev => prev.map(comment => {
                if (comment._id === data.commentId) {
                    return {
                        ...comment,
                        likeCount: data.likeCount,
                        isLiked: data.isLiked,
                    };
                }
                // Check in replies
                if (comment.replies) {
                    return {
                        ...comment,
                        replies: comment.replies.map(reply => 
                            reply._id === data.commentId 
                                ? { ...reply, likeCount: data.likeCount, isLiked: data.isLiked }
                                : reply
                        )
                    };
                }
                return comment;
            }));
        };

        // Listen for comment deletions
        const handleCommentDelete = (data: { commentId: string; isReply: boolean; parentCommentId?: string }) => {
            if (data.isReply && data.parentCommentId) {
                setComments(prev => prev.map(comment => {
                    if (comment._id === data.parentCommentId) {
                        return {
                            ...comment,
                            repliesCount: Math.max(0, comment.repliesCount - 1),
                            replies: comment.replies?.filter(reply => reply._id !== data.commentId) || [],
                        };
                    }
                    return comment;
                }));
            } else {
                setComments(prev => prev.filter(comment => comment._id !== data.commentId));
            }
        };

        // Listen for comment edits/updates
        const handleCommentUpdate = (data: { commentId: string; content: string; isReply: boolean; parentCommentId?: string }) => {
            if (data.isReply && data.parentCommentId) {
                setComments(prev => prev.map(comment => {
                    if (comment._id === data.parentCommentId && comment.replies) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply => 
                                reply._id === data.commentId 
                                    ? { ...reply, content: data.content }
                                    : reply
                            )
                        };
                    }
                    return comment;
                }));
            } else {
                setComments(prev => prev.map(comment => 
                    comment._id === data.commentId 
                        ? { ...comment, content: data.content }
                        : comment
                ));
            }
        };

        // Register socket listeners
        socket.on('comment:new', handleNewComment);
        socket.on('comment:reply', handleNewReply);
        socket.on('comment:like', handleCommentLike);
        socket.on('comment:delete', handleCommentDelete);
        socket.on('comment:update', handleCommentUpdate);

        // Join post room for realtime updates
        socket.emit('post:join', { postId: post._id });

        // Cleanup function
        return () => {
            socket.off('comment:new', handleNewComment);
            socket.off('comment:reply', handleNewReply);
            socket.off('comment:like', handleCommentLike);
            socket.off('comment:delete', handleCommentDelete);
            socket.off('comment:update', handleCommentUpdate);
            socket.emit('post:leave', { postId: post._id });
        };
    }, [post?._id, open]);

    // Load follow status
    React.useEffect(() => {
        if (!post?.authorId || !isAuthenticated || post.authorId === _currentUser?._id) return;

        const loadFollowStatus = async () => {
            try {
                const response = await CommunityService.isFollowing(post.authorId);
                setFollowing(prev => ({ ...prev, [post.authorId]: Boolean(response.data) }));
            } catch (error) {
                console.error("Error loading follow status:", error);
            }
        };

        loadFollowStatus();
    }, [post?.authorId, isAuthenticated, _currentUser?._id]);

    const loadComments = async () => {
        if (!post?._id) return;
        try {
            setLoading(true);
            const response = await CommunityService.listCommentsByPost(post._id);
            if (response.success && response.data) {
                const commentsWithUI = response.data.items.map(comment => ({
                    ...comment,
                    likeCount: comment.likesCount,
                    isLiked: likedComments.has(comment._id),
                    replies: [],
                    showReplies: false,
                    showReplyInput: false,
                }));
                setComments(commentsWithUI);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLikedComments = async () => {
        try {
            const response = await CommunityService.getMyLikedComments();
            if (response.success && response.data) {
                setLikedComments(new Set(response.data));
            }
        } catch (error) {
            console.error('Error loading liked comments:', error);
        }
    };

    const loadReplies = async (commentId: string) => {
        try {
            const response = await CommunityService.listRepliesByComment(commentId);
            if (response.success && response.data) {
                const repliesWithUI = response.data.items.map(reply => ({
                    ...reply,
                    likeCount: reply.likesCount,
                    isLiked: likedComments.has(reply._id),
                }));

                setComments(prev => prev.map(comment => 
                    comment._id === commentId 
                        ? { ...comment, replies: repliesWithUI, showReplies: true }
                        : comment
                ));
            }
        } catch (error) {
            console.error('Error loading replies:', error);
        }
    };

    const onAddComment = async () => {
        checkAuthAndExecute(async () => {
            if (!commentInput.trim() || !post?._id) return;
            
            try {
                const response = await CommunityService.createComment({
                    postId: post._id,
                    content: commentInput.trim(),
                });

                if (response.success && response.data) {
                    // Clear input - server will emit socket event for realtime update
                    setCommentInput("");
                }
            } catch (error) {
                console.error('Error creating comment:', error);
            }
        });
    };

    const onAddReply = async (parentCommentId: string) => {
        checkAuthAndExecute(async () => {
            const replyContent = replyInputs[parentCommentId]?.trim();
            if (!replyContent || !post?._id) return;

            try {
                const response = await CommunityService.createComment({
                    postId: post._id,
                    parentId: parentCommentId,
                    content: replyContent,
                });

                if (response.success && response.data) {
                    // Don't add to local state immediately, wait for socket event
                    setReplyInputs(prev => ({ ...prev, [parentCommentId]: "" }));
                    
                    // Emit socket event to notify other users
                    socket.emit('comment:reply', {
                        postId: post._id,
                        parentCommentId,
                        reply: response.data,
                    });
                }
            } catch (error) {
                console.error('Error creating reply:', error);
            }
        });
    };

    const onLikeComment = async (commentId: string, isReply: boolean = false) => {
        checkAuthAndExecute(async () => {
            // Check current like status from likedComments state
            const isCurrentlyLiked = likedComments.has(commentId);

            // Optimistically update UI immediately
            setLikedComments(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyLiked) {
                    newSet.delete(commentId);
                } else {
                    newSet.add(commentId);
                }
                return newSet;
            });

            // Optimistically update like count in comments
            setComments(prev => prev.map(comment => {
                if (comment._id === commentId) {
                    return {
                        ...comment,
                        likeCount: comment.likeCount + (isCurrentlyLiked ? -1 : 1),
                        isLiked: !isCurrentlyLiked,
                    };
                }
                // Check in replies
                if (comment.replies) {
                    return {
                        ...comment,
                        replies: comment.replies.map(reply => 
                            reply._id === commentId 
                                ? { 
                                    ...reply, 
                                    likeCount: reply.likeCount + (isCurrentlyLiked ? -1 : 1),
                                    isLiked: !isCurrentlyLiked 
                                }
                                : reply
                        )
                    };
                }
                return comment;
            }));

            try {
                if (isCurrentlyLiked) {
                    await CommunityService.unlike({
                        targetType: 'COMMENT',
                        commentId,
                    });
                } else {
                    await CommunityService.like({
                        targetType: 'COMMENT',
                        commentId,
                    });
                }
            } catch (error) {
                console.error('Error liking comment:', error);
                // Revert optimistic updates on error
                setLikedComments(prev => {
                    const newSet = new Set(prev);
                    if (isCurrentlyLiked) {
                        newSet.add(commentId);
                    } else {
                        newSet.delete(commentId);
                    }
                    return newSet;
                });

                // Revert like count
                setComments(prev => prev.map(comment => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            likeCount: comment.likeCount + (isCurrentlyLiked ? 1 : -1),
                            isLiked: isCurrentlyLiked,
                        };
                    }
                    // Check in replies
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply => 
                                reply._id === commentId 
                                    ? { 
                                        ...reply, 
                                        likeCount: reply.likeCount + (isCurrentlyLiked ? 1 : -1),
                                        isLiked: isCurrentlyLiked 
                                    }
                                    : reply
                            )
                        };
                    }
                    return comment;
                }));
            }
        });
    };

    const toggleReplies = (commentId: string) => {
        const comment = comments.find(c => c._id === commentId);
        if (!comment) return;

        if (comment.showReplies) {
            // Hide replies
            setComments(prev => prev.map(c => 
                c._id === commentId ? { ...c, showReplies: false } : c
            ));
        } else {
            // Load and show replies
            loadReplies(commentId);
        }
    };

    // No longer needed since we removed reply input functionality
    // const toggleReplyInput = (commentId: string) => {
    //     setComments(prev => prev.map(comment => 
    //         comment._id === commentId 
    //             ? { ...comment, showReplyInput: !comment.showReplyInput }
    //             : comment
    //     ));
    // };

    const updateReplyInput = (commentId: string, value: string) => {
        setReplyInputs(prev => ({ ...prev, [commentId]: value }));
    };

    const onEditComment = (commentId: string, currentContent: string) => {
        setEditingComment(commentId);
        setEditContent(currentContent);
    };

    const onSaveEditComment = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            const response = await CommunityService.updateComment(commentId, {
                content: editContent.trim(),
            });

            if (response.success && response.data && post?._id) {
                // Emit socket event for realtime updates
                const isReply = comments.some(comment => 
                    comment.replies?.some(reply => reply._id === commentId)
                );
                const parentCommentId = isReply 
                    ? comments.find(comment => 
                        comment.replies?.some(reply => reply._id === commentId)
                      )?._id 
                    : undefined;

                socket.emit('comment:update', {
                    postId: post._id,
                    commentId,
                    content: editContent.trim(),
                    isReply,
                    parentCommentId,
                });

                setEditingComment(null);
                setEditContent("");
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const onCancelEditComment = () => {
        setEditingComment(null);
        setEditContent("");
    };

    const onDeleteComment = async (commentId: string) => {
        setCommentToDelete(commentId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!commentToDelete) return;

        try {
            const response = await CommunityService.deleteComment(commentToDelete);

            if (response.success && post?._id) {
                // Socket event will be emitted from backend automatically
                // No need to emit here as backend handles it
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setCommentToDelete(null);
        }
    };

    if (!post) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => handleOpenUserWall(post.authorId)}
                                className="hover:underline"
                            >
                                <DialogTitle>{post.authorName}</DialogTitle>
                            </button>
                        </div>
                        
                        {/* Follow and Message buttons */}
                        {post.authorId !== _currentUser?._id && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleToggleFollow(post.authorId, following[post.authorId])}
                                    disabled={followLoading[post.authorId]}
                                    className={`px-3 py-1 text-sm rounded-md ${
                                        following[post.authorId] 
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    } disabled:opacity-50`}
                                >
                                    {(() => {
                                        if (followLoading[post.authorId]) return '...';
                                        return following[post.authorId] ? 'Unfollow' : 'Follow';
                                    })()}
                                </button>
                                
                                <button
                                    onClick={() => handleOpenChat(post.authorId)}
                                    title="Send message"
                                    className="p-1 text-gray-600 hover:text-blue-500 hover:bg-gray-100 rounded-md"
                                >
                                    <MessageCircle size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    <DialogDescription>{post.content}</DialogDescription>
                </DialogHeader>

                {/* Comments Section */}
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Main Comment Input */}
                    <div className="relative">
                        <div className="flex items-start space-x-3 mb-4">
                            {_currentUser?.avatarUrl ? (
                                <img src={_currentUser.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">{getInitials(_currentUser?.fullName)}</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center border border-gray-200 rounded-lg px-3">
                                    <input
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="flex-1 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && onAddComment()}
                                    />
                                    <button
                                        onClick={onAddComment}
                                        disabled={!commentInput.trim()}
                                        aria-label="Send comment"
                                        className="p-1 text-rose-600 disabled:opacity-40"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {!isAuthenticated() && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <button 
                                    onClick={() => globalThis.location.href = '/auth/login'}
                                    className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors"
                                >
                                    Login to experience
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600 mx-auto"></div>
                        </div>
                    )}

                    {/* Comment List */}
                    {!loading && comments.length === 0 && (
                        <div className="text-sm text-gray-400 text-center py-8">No comments yet. Be the first to comment.</div>
                    )}

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment._id} className="space-y-3">
                                {/* Top-level Comment */}
                                <div className="flex items-start space-x-3">
                                    {comment.authorAvatarUrl ? (
                                        <img src={comment.authorAvatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold">{getInitials(comment.authorName)}</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                                            <div className="text-sm font-medium text-gray-900">
                                                {comment.authorName}
                                                {comment.authorRole && comment.authorRole.toUpperCase() === USER_ROLES.ARTIST && (
                                                    <span className="relative group ml-1 cursor-pointer">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="inline-flex items-center justify-center rounded-full bg-rose-600 p-[0.1rem]">
                                                                        <Check className="w-2 h-2 text-white font-semibold" />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="bg-gray-900 text-white text-xs">
                                                                    <p>Verified Artist badge</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </span>
                                                )}
                                                {comment.authorId === post.authorId && (
                                                    <span className="ml-2 inline-block bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full">Author</span>
                                                )}
                                            </div>
                                            {editingComment === comment._id ? (
                                                <div className="mt-2">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        aria-label="Edit comment"
                                                        placeholder="Edit your comment..."
                                                        className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                        rows={3}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                onSaveEditComment(comment._id);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                onCancelEditComment();
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex justify-end space-x-2 mt-2">
                                                        <button
                                                            onClick={onCancelEditComment}
                                                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => onSaveEditComment(comment._id)}
                                                            disabled={!editContent.trim()}
                                                            className="px-3 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-800">{comment.content}</div>
                                            )}
                                        </div>
                                        
                                        {/* Comment Actions */}
                                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                            <span>{formatTimeAgo(comment.createdAt)}</span>
                                            <button 
                                                onClick={() => onLikeComment(comment._id)}
                                                className={`hover:text-rose-600 ${likedComments.has(comment._id) ? 'text-rose-600' : ''}`}
                                            >
                                                Like • {comment.likeCount}
                                            </button>
                                            {/* <button 
                                                onClick={() => toggleReplyInput(comment._id)}
                                                className="hover:text-rose-600"
                                            >
                                                Reply
                                            </button> */}
                                            {comment.repliesCount >= 0 && (
                                                <button 
                                                    onClick={() => toggleReplies(comment._id)}
                                                    className="hover:text-rose-600 flex items-center space-x-1"
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                    <span>{comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}</span>
                                                </button>
                                            )}
                                            <div className="ml-auto">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            aria-label="Comment options"
                                                            className="border-none p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                                                        {isSelfUser(comment.authorId) && (
                                                            <>
                                                            <DropdownMenuItem
                                                                className="cursor-pointer focus:bg-rose-100"
                                                                onClick={() => onEditComment(comment._id, comment.content)}
                                                            >
                                                                Edit comment
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-rose-600 cursor-pointer focus:bg-rose-100"
                                                                onClick={() => onDeleteComment(comment._id)}
                                                            >
                                                                Delete comment
                                                            </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-rose-600 cursor-pointer focus:bg-rose-100"
                                                            onClick={() => alert('Comment reported')}
                                                        >
                                                            Report
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Reply Input */}
                                        {comment.showReplyInput && (
                                            <div className="flex items-start space-x-3 mt-3">
                                                {_currentUser?.avatarUrl ? (
                                                    <img src={_currentUser.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-semibold">{getInitials(_currentUser?.fullName)}</span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center border border-gray-200 rounded-lg px-3">
                                                        <input
                                                            value={replyInputs[comment._id] || ""}
                                                            onChange={(e) => updateReplyInput(comment._id, e.target.value)}
                                                            placeholder="Write a reply..."
                                                            className="flex-1 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                                                            onKeyDown={(e) => e.key === 'Enter' && onAddReply(comment._id)}
                                                        />
                                                        <button
                                                            onClick={() => onAddReply(comment._id)}
                                                            disabled={!replyInputs[comment._id]?.trim()}
                                                            aria-label="Send reply"
                                                            className="p-1 text-rose-600 disabled:opacity-40"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {comment.showReplies && comment.replies  && (
                                            <>
                                             <div className="flex items-start space-x-3 mt-3">
                                                {_currentUser?.avatarUrl ? (
                                                    <img src={_currentUser.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-semibold">{getInitials(_currentUser?.fullName)}</span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center border border-gray-200 rounded-lg px-3">
                                                        <input
                                                            value={replyInputs[comment._id] || ""}
                                                            onChange={(e) => updateReplyInput(comment._id, e.target.value)}
                                                            placeholder="Write a reply..."
                                                            className="flex-1 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                                                            onKeyDown={(e) => e.key === 'Enter' && onAddReply(comment._id)}
                                                        />
                                                        <button
                                                            onClick={() => onAddReply(comment._id)}
                                                            disabled={!replyInputs[comment._id]?.trim()}
                                                            aria-label="Send reply"
                                                            className="p-1 text-rose-600 disabled:opacity-40"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-6 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply._id} className="flex items-start space-x-3">
                                                        {reply.authorAvatarUrl ? (
                                                            <img src={reply.authorAvatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-xs font-semibold">{getInitials(reply.authorName)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {reply.authorName}
                                                                    {reply.authorRole && reply.authorRole.toUpperCase() === USER_ROLES.ARTIST && (
                                                                        <span className="relative group ml-1 cursor-pointer">
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <span className="inline-flex items-center justify-center rounded-full bg-rose-600 p-[0.1rem]">
                                                                                            <Check className="w-2 h-2 text-white font-semibold" />
                                                                                        </span>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="bg-gray-900 text-white text-xs">
                                                                                        <p>Verified Artist badge</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        </span>
                                                                    )}
                                                                    {reply.authorId === post.authorId && (
                                                                        <span className="ml-2 inline-block bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full">Author</span>
                                                                    )}
                                                                </div>
                                                                {editingComment === reply._id ? (
                                                                    <div className="mt-2">
                                                                        <textarea
                                                                            value={editContent}
                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                            aria-label="Edit reply"
                                                                            placeholder="Edit your reply..."
                                                                            className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                                            rows={2}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                                    e.preventDefault();
                                                                                    onSaveEditComment(reply._id);
                                                                                }
                                                                                if (e.key === 'Escape') {
                                                                                    onCancelEditComment();
                                                                                }
                                                                            }}
                                                                        />
                                                                        <div className="flex justify-end space-x-2 mt-2">
                                                                            <button
                                                                                onClick={onCancelEditComment}
                                                                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                onClick={() => onSaveEditComment(reply._id)}
                                                                                disabled={!editContent.trim()}
                                                                                className="px-3 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm text-gray-800">{reply.content}</div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Reply Actions */}
                                                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                                <span>{formatTimeAgo(reply.createdAt)}</span>
                                                                <button 
                                                                    onClick={() => onLikeComment(reply._id, true)}
                                                                    className={`hover:text-rose-600 ${likedComments.has(reply._id) ? 'text-rose-600' : ''}`}
                                                                >
                                                                    Like • {reply.likeCount}
                                                                </button>
                                                                <div className="ml-auto">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <button
                                                                                type="button"
                                                                                aria-label="Reply options"
                                                                                className="border-none p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                                                            >
                                                                                <MoreHorizontal className="w-3 h-3" />
                                                                            </button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                                                                            {isSelfUser(reply.authorId) && (
                                                                                 <>
                                                                            <DropdownMenuItem
                                                                                className="cursor-pointer focus:bg-rose-100"
                                                                                onClick={() => onEditComment(reply._id, reply.content)}
                                                                            >
                                                                                Edit reply
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                className="text-rose-600 cursor-pointer focus:bg-rose-100"
                                                                                onClick={() => onDeleteComment(reply._id)}
                                                                            >
                                                                                Delete reply
                                                                            </DropdownMenuItem>
                                                                            </>
                                                                            )}
                                                                            <DropdownMenuItem
                                                                                className="text-rose-600 cursor-pointer focus:bg-rose-100"
                                                                                onClick={() => alert('Reply reported')}
                                                                            >
                                                                                Report
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
            />
        </Dialog>
    );
}