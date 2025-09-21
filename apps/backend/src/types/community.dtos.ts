import type { PostStatus, TargetType } from "constants/index"


export interface CreatePostDTO {
  title: string;
  content?: string;
  images?: string[];
  tags?: string[]; // tên thẻ, sẽ tự động tạo thẻ mới nếu chưa có
  status?: PostStatus; // default PUBLISHED
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  images?: string[];
  tags?: string[]; // tên thẻ, sẽ tự động tạo thẻ mới nếu chưa có
  status?: PostStatus; // default PUBLISHED
}

export interface PostResponseDTO {
    _id: string;
    authorId: string;
    authorName:string;
    authorRole:string;
    content?: string;
    images?: string[];
    likesCount: number;
    commentsCount: number;
    topComments?: CommentResponseDTO[];
    tags?: string[];
    status?: PostStatus; // default PUBLISHED
    createdAt: Date;
    updatedAt: Date;
}
export interface CommentResponseDTO {
    _id: string;
    authorId: string;
    authorName:string;
    authorRole:string;
    content: string;
    likesCount: number;
    createdAt: Date;
    updatedAt: Date;
}


export interface ReactionDTO {
 userId: string;
 targetType: TargetType;
 postId?: string;
 commentId?: string;
}
export interface ReactionResponseDTO {
    _id: string;
    userId: string;
    targetType: TargetType;
    postId?: string;
    commentId?: string;
    createdAt: Date;
    updatedAt: Date;
}