export interface User {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  imageUrl: string;
  createdAt: Date;
  isViewed: boolean;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images?: string[];
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  privacy: 'public' | 'friends' | 'private';
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  attendeeCount: number;
  isAttending: boolean;
}

export interface Page {
  id: string;
  name: string;
  avatarUrl?: string;
  category: string;
  isLiked: boolean;
}
