import { PostStatus, ResourceType, TargetType } from "../constants";


export interface CreatePostDTO {
  content?: string;
  media?: { type: ResourceType; url: string }[];
  tags?: string[];
  status?: PostStatus;
}

export interface UpdatePostDTO {
  content?: string;
  media?: { type: ResourceType; url: string }[];
  tags?: string[];
  status?: PostStatus;
}


export interface PostResponseDTO {
    _id: string;
    authorId: string;
    authorName:string;
    authorRole:string;
    content?: string;
    media: {type: ResourceType; url: string}[];
    likesCount: number;
    commentsCount: number;
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
export interface TagResponseDTO {
  _id: string;
  name: string;
  slug: string;
  postsCount: number;
}
export interface UserWallResponseDTO{
  _id: string;
  fullName: string;
  avatarUrl: string;
  role:string;
  postsCount: number;
  followersCount: number;
  followingsCount: number;
}