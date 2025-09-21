import { Image, Hash, AtSign } from 'lucide-react';
import React, { useEffect } from 'react';
import { CommunityService } from '@/services/community';
import type { CreatePostDTO, PostResponseDTO } from '@/types/community.dtos';
import { POST_STATUS } from '../../constants';
import { socket } from '@/config/socket';
import { MinimalUser } from './MainContent';

type Privacy = 'public' | 'friends' | 'private';

export default function PostCreator({
  postText,
  setPostText,
  privacy,
  setPrivacy,
  posts,
  setPosts,
  currentUser,
}: Readonly<{
  postText: string;
  setPostText: (text: string) => void;
  privacy: Privacy;
  setPrivacy: (p: Privacy) => void;
  posts: PostResponseDTO[];
  setPosts: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>;
  currentUser: MinimalUser;
}>) {
  useEffect(() => {
    const onNewPost = (post: PostResponseDTO) => {
      setPosts(prev => (prev.some(p => p._id === post._id) ? prev : [post, ...prev]));
    };
    socket.on('newPost', onNewPost);
    return () => {
      socket.off('newPost', onNewPost);
    };
  }, [setPosts]);

  const mapPrivacyToStatus = (p: Privacy) => (p === 'private' ? POST_STATUS.PRIVATE : POST_STATUS.PUBLISHED);
  const deriveTitle = (text: string) => text.trim().slice(0, 80) || 'Post';

  const handleCreatePost = async () => {
    const content = postText.trim();
    if (!content) return;
    const payload: CreatePostDTO = {
      title: deriveTitle(content),
      content,
      images: [],
      status: mapPrivacyToStatus(privacy),
    };
    try {
      const res = await CommunityService.createPost(payload);
      if (res?.success && res.data) {
        console.log('Created post:', res.data);
        // Optimistic: prepend locally; socket 'newPost' listener will guard against duplicates
        setPosts(prev => (prev.some(p => p._id === res.data!._id) ? prev : [res.data!, ...prev]));
        setPostText('');
      }
    } catch (e) {
      // Optional: show toast
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
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
                <Image className="w-5 h-5 mr-1" /> Image/Video
              </button>
              <button className="flex items-center text-gray-500 hover:text-rose-600">
                <Hash className="w-5 h-5 mr-1" /> Hashtag
              </button>
              <button className="flex items-center text-gray-500 hover:text-rose-600">
                <AtSign className="w-5 h-5 mr-1" /> Mention
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <select value={privacy} onChange={(e) => setPrivacy(e.target.value as Privacy)} className="text-sm text-gray-500 border-none focus:outline-none">
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Only Me</option>
              </select>
              <button 
                onClick={handleCreatePost}
                disabled={!postText.trim()}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50"
              >
                Share Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
