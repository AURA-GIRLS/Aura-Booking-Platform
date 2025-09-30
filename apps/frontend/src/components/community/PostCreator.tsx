'use client';

import { Image, Hash, X, Check, Plus, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CommunityService } from '@/services/community';
import type { CreatePostDTO, PostResponseDTO, TagResponseDTO, UserWallResponseDTO } from '@/types/community.dtos';
import { POST_STATUS } from '../../constants';
import { socket } from '@/config/socket';
import { UploadService, type ResourceType } from '@/services/upload';
import ServiceSearchDialog from './ServiceSearchDialog';
import { ServiceResponseDTO } from '@/types/service.dtos';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/lib/ui/select";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/lib/ui/command";
import { Badge } from "@/components/lib/ui/badge";

type Privacy = 'public' | 'friends' | 'private';

export default function PostCreator({
  postText,
  setPostText,
  privacy,
  setPrivacy,
  posts,
  setPosts,
  currentUser,
  fetchMinimalUser
}: Readonly<{
  postText: string;
  setPostText: (text: string) => void;
  privacy: Privacy;
  setPrivacy: (p: Privacy) => void;
  posts: PostResponseDTO[];
  setPosts: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>;
  currentUser: UserWallResponseDTO;
  fetchMinimalUser: () => Promise<void>;
}>) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  // Tags state
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [allTags, setAllTags] = useState<TagResponseDTO[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Services state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceResponseDTO[]>([]);

  const prependIfMissing = useCallback((list: PostResponseDTO[], item: PostResponseDTO) => (
    list.some(p => p._id === item._id) ? list : [item, ...list]
  ), []);
  const prependPost = useCallback((post: PostResponseDTO) => {
    setPosts(prev => prependIfMissing(prev, post));
  }, [setPosts, prependIfMissing]);

  const handleRemovePreview = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const idx = Number((e.currentTarget as HTMLButtonElement).value);
    if (Number.isNaN(idx)) return;
    setFiles((prev) => prev.filter((_, j) => j !== idx));
  }, []);

  // Realtime new post
  useEffect(() => {
    const onNewPost = (post: PostResponseDTO) => {
      prependPost(post);
      if (post?.authorId && currentUser?._id && post.authorId === (currentUser as any)._id) {
        void fetchMinimalUser?.();
      }
    };
    socket.on('newPost', onNewPost);
    return () => {
      socket.off('newPost', onNewPost);
    };
  }, [prependPost, currentUser, fetchMinimalUser]);

  // Fetch tags when dialog opens first time
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const res = await CommunityService.getAllTags();
        if (res?.success && Array.isArray(res.data)) setAllTags(res.data);
      } catch (e) {
        console.error('Failed to fetch tags', e);
      } finally {
        setTagsLoading(false);
      }
    };
    if (tagDialogOpen && allTags.length === 0 && !tagsLoading) {
      fetchTags();
    }
  }, [tagDialogOpen, allTags.length, tagsLoading]);

  const sanitizeTag = (raw: string) => raw.replace(/^#+/, '').trim();
  const isSelected = useCallback((name: string) => {
    const n = name.toLowerCase();
    return selectedTags.some(t => t.toLowerCase() === n);
  }, [selectedTags]);
  const toggleTag = useCallback((name: string) => {
    const cleaned = sanitizeTag(name);
    if (!cleaned) return;
    setSelectedTags(prev => {
      const exists = prev.some(t => t.toLowerCase() === cleaned.toLowerCase());
      return exists ? prev.filter(t => t.toLowerCase() !== cleaned.toLowerCase()) : [...prev, cleaned];
    });
  }, []);
  const removeTag = useCallback((name: string) => {
    setSelectedTags(prev => prev.filter(t => t.toLowerCase() !== name.toLowerCase()));
  }, []);

  const mapPrivacyToStatus = (p: Privacy) =>
    (p === 'private' ? POST_STATUS.PRIVATE : POST_STATUS.PUBLISHED);

  const handleCreatePost = async () => {
    const content = postText.trim();
    if (!content) return;

    setIsSubmitting(true);
    try {
      // Upload files
      let media: { type: ResourceType; url: string }[] = [];
      if (files.length > 0) {
        const uploadOne = async (file: File) => {
          let guessedType: ResourceType = 'raw';
          if (file.type.startsWith('video/')) guessedType = 'video';
          else if (file.type.startsWith('image/')) guessedType = 'image';
          const res = await UploadService.uploadFile(file, {
            resourceType: guessedType,
            folder: 'community/posts'
          });
          if (res.success && res.data) return { type: res.data.resourceType, url: res.data.url };
          return null;
        };
        const results = await Promise.all(files.map(uploadOne));
        media = results.filter((x): x is { type: ResourceType; url: string } => !!x);
      }

      const payload: CreatePostDTO = {
        content,
        media,
        tags: selectedTags,
        status: mapPrivacyToStatus(privacy),
        attachedServices: selectedServices.map(s => s._id),
      };

      await CommunityService.createPost(payload);

      // Clear inputs
      setPostText('');
      setFiles([]);
      setSelectedTags([]);
      setSelectedServices([]);
    } catch (e) {
      console.error('Create post failed', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <>
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-start space-x-3">
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt="avatar"
            className="w-10 h-10 object-cover rounded-full border-2 border-white"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getInitials(currentUser.fullName)}
            </span>
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border-none resize-none text-gray-700 placeholder-gray-400 focus:outline-none"
            rows={3}
          />
          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTags.map((t) => (
                <Badge key={t} variant="secondary" className="flex items-center gap-1">
                  #{t}
                  <button
                    type="button"
                    aria-label={`Remove tag ${t}`}
                    onClick={() => removeTag(t)}
                    className="ml-1 hover:text-foreground/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Selected services */}
          {selectedServices.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="text-sm text-gray-600 font-medium">
                Selected services ({selectedServices.length}):
              </div>
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div key={service._id} className="flex items-center space-x-3 p-2 bg-rose-50 rounded-lg border border-rose-200">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0]}
                        alt={service.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {service.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{service.name}</p>
                      <p className="text-xs text-gray-600">by {service.muaName}</p>
                    </div>
                    <button
                      type="button"
                      title={`Remove ${service.name}`}
                      onClick={() => setSelectedServices(prev => prev.filter(s => s._id !== service._id))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Previews */}
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative group rounded-lg overflow-hidden border">
                  <img src={src} alt={`preview-${i}`} className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    aria-label="Remove file"
                    value={`${i}`}
                    onClick={handleRemovePreview}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-4 ">
              <label className="flex items-center text-sm text-gray-500 hover:text-rose-600 cursor-pointer">
                <Image className="w-5 h-5 mr-1" />
                <span>Image/Video</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const sel = Array.from(e.target.files || []);
                    if (sel.length) setFiles((prev) => [...prev, ...sel]);
                  }}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setTagDialogOpen(true)}
                className="flex items-center text-sm text-gray-500 hover:text-rose-600"
              >
                <Hash className="w-5 h-5 mr-1" /> Hashtag
              </button>
              <button
                type="button"
                onClick={() => setServiceDialogOpen(true)}
                className="flex items-center text-sm text-gray-500 hover:text-rose-600"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6a2 2 0 00-2 2v6.002" />
                </svg>
                Services
              </button>
              <Select value={privacy} onValueChange={(v) => setPrivacy(v as Privacy)}>
                <SelectTrigger className="w-[8rem] text-sm text-gray-500 border-none focus:outline-none">
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Only Me</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || !postText.trim()}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium 
                           hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Share Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

     
    </div>
     {/* Tag Command Dialog */}
      <CommandDialog
        className="bg-white text-foreground max-w-2xl w-[40vw]"
        open={tagDialogOpen}
        onOpenChange={(o) => {
          setTagDialogOpen(o);
          setTagQuery("");
        }}
      >
        <CommandInput
          placeholder="Search or create tag..."
          value={tagQuery}
          onValueChange={setTagQuery}
        />
        <CommandList>
          <CommandEmpty>
            {sanitizeTag(tagQuery)
              ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No tags found. Press Enter to create “{sanitizeTag(tagQuery)}”.
                </div>
              )
              : 'No tags found.'}
          </CommandEmpty>
          {allTags.length > 0 && (
            <CommandGroup heading="All tags">
              {allTags.map((t) => {
                const name = t.name || t.slug;
                const active = isSelected(name);
                return (
                  <CommandItem
                    className="hover:bg-gray-100 focus:bg-gray-100 flex items-center cursor-pointer"
                    key={t._id}
                    value={name}
                    onSelect={(val) => toggleTag(val)}
                  >
                    <span className="mr-2">#</span>
                    <span className="truncate">{name}</span>
                    {active && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          <CommandSeparator />
          {sanitizeTag(tagQuery) &&
            !isSelected(sanitizeTag(tagQuery)) &&
            !allTags.some(
              t => (t.name || t.slug).toLowerCase() === sanitizeTag(tagQuery).toLowerCase()
            ) && (
              <CommandGroup heading="Create">
                <CommandItem
                  className="hover:bg-gray-100 focus:bg-gray-100"
                  value={sanitizeTag(tagQuery)}
                  onSelect={(val) => {
                    toggleTag(val);
                    setTagQuery("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create “{sanitizeTag(tagQuery)}”
                </CommandItem>
              </CommandGroup>
            )}
        </CommandList>
      </CommandDialog>

      {/* Service Search Dialog */}
      <ServiceSearchDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        selectedServices={selectedServices}
        onServicesChange={setSelectedServices}
      />
    </>
  );
}
