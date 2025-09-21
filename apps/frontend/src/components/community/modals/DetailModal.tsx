"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/lib/ui/dialog";
import { Send, MoreHorizontal, Check } from "lucide-react";
import { USER_ROLES } from "@/constants/index";
import type { CommentResponseDTO, PostResponseDTO, UserWallResponseDTO } from "@/types/community.dtos";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/lib/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/lib/ui/dropdown-menu";

type UIComment = CommentResponseDTO & { isLiked?: boolean; likeCount: number };

export default function DetailModal({
    open,
    onOpenChange,
    post,
    comments,
    commentInput,
    onCommentInputChange,
    onAddComment,
    onLikeComment,
    getInitials,
    formatTimeAgo,
    isSelfUser,
    _currentUser,
}: Readonly<{
    open: boolean;
    onOpenChange: (val: boolean) => void;
    post: PostResponseDTO | null;
    comments: UIComment[];
    commentInput: string;
    onCommentInputChange: (val: string) => void;
    onAddComment: () => void;
    onLikeComment: (commentId: string) => void;
    getInitials: (name: string) => string;
    formatTimeAgo: (date: Date | string) => string;
    isSelfUser: (id?: string) => boolean;
    _currentUser: UserWallResponseDTO;
}>) {
    if (!post) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle>{post.authorName}</DialogTitle>
                    <DialogDescription>{post.content}</DialogDescription>
                </DialogHeader>

                {/* Comments Section */}
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Input */}
                    <div className="flex items-start space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">{getInitials(_currentUser.fullName)}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center border border-gray-200 rounded-lg px-3">
                                <input
                                    value={commentInput}
                                    onChange={(e) => onCommentInputChange(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
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

                    {/* Comment List */}
                    {comments.length === 0 && (
                        <div className="text-sm text-gray-400">No comments yet. Be the first to comment.</div>
                    )}
                    <div className="space-y-3">
                        {(comments || []).map((c) => (
                            <div key={c._id} className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">{getInitials(c.authorName)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                                        <div className="text-sm font-medium text-gray-900">{c.authorName}
                                            {c.authorRole && c.authorRole.toUpperCase() === USER_ROLES.ARTIST && (
                                                <span className="relative group ml-1 cursor-pointer">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span
                                                                    className="inline-flex items-center justify-center rounded-full bg-rose-600 p-[0.1rem]"
                                                                    aria-describedby={`artist-tip-${c._id}`}
                                                                >
                                                                    <Check className="w-2 h-2 text-white font-semibold" aria-hidden="true" />
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-gray-900 text-white text-xs">
                                                                <p>Verified Artist badge</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </span>
                                            )}
                                            {c.authorId === post.authorId && (
                                                <span className="ml-2 inline-block bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full">Author</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-800">{c.content}</div>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                        <span>{formatTimeAgo(c.createdAt)}</span>
                                        <button onClick={() => onLikeComment(c._id)} className={`hover:text-rose-600 ${c.isLiked ? 'text-rose-600' : ''}`}>Like • {c.likeCount}</button>
                                        <div className="ml-auto">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        title="Comment actions"
                                                        className="border-none p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                                        aria-label="Comment actions"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                                                    {isSelfUser(c.authorId) && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer focus:bg-rose-100 data-[highlighted]:bg-rose-100"
                                                            onClick={() => { alert('Feature coming soon: edit comment'); }}
                                                        >
                                                            Edit comment
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-rose-600 cursor-pointer focus:bg-rose-100 focus:text-rose-700 data-[highlighted]:bg-rose-100"
                                                        onClick={() => { alert('Comment reported'); }}
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
