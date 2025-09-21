import { User, Story, Post, Conversation, Event, Page } from '../../../types/community.types';

export const mockUser: User = {
  id: '1',
  fullName: 'Jakob Botosh',
  username: 'jakobotosh',
  avatarUrl: '',
  bio: 'UI/UX Designer & Creative Developer',
  isVerified: true,
  followerCount: 2300,
  followingCount: 235,
  postCount: 80
};

export const mockUsers: User[] = [
  {
    id: '2',
    fullName: 'Cameron Williamson',
    username: 'cameronw',
    avatarUrl: '',
    followerCount: 1200,
    followingCount: 180,
    postCount: 45
  },
  {
    id: '3',
    fullName: 'Terry Lipshutz',
    username: 'terryl',
    avatarUrl: '',
    followerCount: 890,
    followingCount: 120,
    postCount: 32
  },
  {
    id: '4',
    fullName: 'Justin Rosser',
    username: 'justinr',
    avatarUrl: '',
    followerCount: 1500,
    followingCount: 200,
    postCount: 67
  },
  {
    id: '5',
    fullName: 'Davis Dorward',
    username: 'davisd',
    avatarUrl: '',
    followerCount: 750,
    followingCount: 95,
    postCount: 28
  }
];

export const mockStories: Story[] = [
  {
    id: '1',
    userId: '4',
    user: mockUsers[2],
    imageUrl: '/api/placeholder/64/64',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isViewed: false
  },
  {
    id: '2',
    userId: '5',
    user: mockUsers[3],
    imageUrl: '/api/placeholder/64/64',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isViewed: true
  },
  {
    id: '3',
    userId: '2',
    user: mockUsers[0],
    imageUrl: '/api/placeholder/64/64',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isViewed: false
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '2',
    user: mockUsers[0],
    content: 'Just finished working on this amazing design project! The creative process was incredible and I learned so much about user experience design. Can\'t wait to share more details soon! 🎨✨',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    likeCount: 30,
    commentCount: 12,
    shareCount: 6,
    isLiked: false,
    privacy: 'public'
  },
  {
    id: '2',
    userId: '3',
    user: mockUsers[1],
    content: 'Beautiful sunset today! Sometimes you need to step away from the screen and appreciate the world around you. Nature is the best designer. 🌅',
    images: ['/api/placeholder/600/400'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likeCount: 45,
    commentCount: 8,
    shareCount: 3,
    isLiked: true,
    privacy: 'public'
  },
  {
    id: '3',
    userId: '4',
    user: mockUsers[2],
    content: 'Working on some new UI components for our design system. The attention to detail in micro-interactions makes all the difference in user experience!',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    likeCount: 67,
    commentCount: 15,
    shareCount: 12,
    isLiked: false,
    privacy: 'public'
  }
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [mockUser, mockUsers[0]],
    lastMessage: {
      id: '1',
      senderId: '2',
      receiverId: '1',
      content: 'Hey! How\'s the project going?',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false
    },
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '2',
    participants: [mockUser, mockUsers[1]],
    lastMessage: {
      id: '2',
      senderId: '1',
      receiverId: '3',
      content: 'Thanks for the feedback!',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true
    },
    unreadCount: 0,
    isOnline: false
  },
  {
    id: '3',
    participants: [mockUser, mockUsers[2]],
    lastMessage: {
      id: '3',
      senderId: '4',
      receiverId: '1',
      content: 'Let\'s schedule a call tomorrow',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: false
    },
    unreadCount: 1,
    isOnline: true
  },
   {
    id: '4',
    participants: [mockUser, mockUsers[0]],
    lastMessage: {
      id: '1',
      senderId: '2',
      receiverId: '1',
      content: 'Hey! How\'s the game going?',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false
    },
    unreadCount: 2,
    isOnline: true
  },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Design System Collaboration',
    description: 'Workshop on building scalable design systems',
    location: 'Harpoon Mall, YK',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    attendeeCount: 45,
    isAttending: true
  },
  {
    id: '2',
    title: 'Web Dev 2.0 Meetup',
    description: 'Latest trends in web development',
    location: 'Yoshkar-Ola, Russia',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    attendeeCount: 120,
    isAttending: false
  },
  {
    id: '3',
    title: 'Prada\'s Invitation Birthday',
    description: 'Birthday celebration party',
    location: 'Private Venue',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    attendeeCount: 25,
    isAttending: true
  }
];

export const mockPages: Page[] = [
  {
    id: '1',
    name: 'UI/UX Community',
    avatarUrl: '',
    category: 'Design',
    isLiked: true
  },
  {
    id: '2',
    name: 'Web Designer',
    avatarUrl: '',
    category: 'Design',
    isLiked: true
  },
  {
    id: '3',
    name: 'Dribbble Community',
    avatarUrl: '',
    category: 'Design',
    isLiked: true
  }
];
