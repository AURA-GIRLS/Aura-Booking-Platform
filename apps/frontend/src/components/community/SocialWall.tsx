"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { PostResponseDTO, UserWallResponseDTO } from "@/types/community.dtos";
import type { UserResponseDTO } from "@/types/user.dtos";
import { CommunityService } from "@/services/community";
import PostsFeed from "./PostsFeed";
import PostCreator from "./PostCreator";
import { ExternalLink, MessageCircle, UserPlus, UserCheck, Heart, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../lib/ui/tooltip";
import { Skeleton } from "../lib/ui/skeleton";

type Props = {
  userId?: string; // Profile user ID to view; if omitted, fallback to current logged-in user
  onOpenMiniChat: (userId: string) => void;
};

// Removed large left-side Artist panel; we now embed a compact artist summary above Top posts.

type FeaturedPostsProps = Readonly<{ featuredPosts: PostResponseDTO[]; onClickPost: (id: string) => void }>;
function FeaturedPosts({ featuredPosts, onClickPost }: FeaturedPostsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-[15px]">Top posts</h3>
        <span className="text-xs text-gray-400">Top 3</span>
      </div>
      {featuredPosts.length === 0 ? (
        <p className="text-sm text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {featuredPosts.map((p) => {
            const firstImage = Array.isArray((p as any).media)
              ? ((p as any).media.find((m: any) => m?.type === "image")?.url as string | undefined)
              : undefined;
            return (
              <button
                key={p._id}
                type="button"
                onClick={() => onClickPost(p._id)}
                className="text-left rounded-lg overflow-hidden border hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-white"
              >
                {firstImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={firstImage} alt="cover" className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
                <div className="p-3">
                  <p className="text-[13px] line-clamp-2 text-gray-800">{p.content || ""}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.likesCount || 0}</div>
                    <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {p.commentsCount || 0}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type NewestPostsProps = Readonly<{
  newestPosts: PostResponseDTO[];
  setPosts: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>;
  viewerMinimal: any;
  fetchViewerMinimal: () => Promise<void>;
  onOpenMiniChat: (userId: string) => void;
}>;
function NewestPosts({ newestPosts, setPosts, viewerMinimal, fetchViewerMinimal, onOpenMiniChat }: NewestPostsProps) {
  return (
    <div className="bg-transparent fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-[15px]">Newest</h3>
      </div>
      <PostsFeed
        posts={newestPosts}
        setPosts={setPosts}
        currentUser={viewerMinimal}
        fetchMinimalUser={fetchViewerMinimal}
        onOpenMiniChat={onOpenMiniChat}
      />
    </div>
  );
}

export default function SocialWall({ userId, onOpenMiniChat }: Readonly<Props>) {
  const [profile, setProfile] = useState<UserWallResponseDTO | null>(null);
  const [viewer, setViewer] = useState<UserWallResponseDTO | null>(null); // minimal of current logged-in user
  const [posts, setPosts] = useState<PostResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  // Local state for creating posts when it's your own wall
  const [postText, setPostText] = useState<string>("");
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>("public");

  const getInitials = (name?: string) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const fetchViewerMinimal = useCallback(async () => {
    try {
      const raw = globalThis.window ? globalThis.localStorage.getItem("currentUser") : null;
      const localUser = raw ? (JSON.parse(raw) as UserResponseDTO) : null;
      if (!localUser?._id) { setViewer(null); return; }
      const res = await CommunityService.getUserWall(localUser._id);
      if (res.success && res.data) setViewer(res.data);
    } catch {
      setViewer(null);
    }
  }, []);

  const targetUserId = useMemo(() => {
    if (userId) return userId;
    try {
      const raw = globalThis.window ? globalThis.localStorage.getItem("currentUser") : null;
      const localUser = raw ? (JSON.parse(raw) as UserResponseDTO) : null;
      return localUser?._id || "";
    } catch {
      return "";
    }
  }, [userId]);

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;
    const res = await CommunityService.getUserWall(targetUserId);
    if (res.success && res.data) setProfile(res.data);
  }, [targetUserId]);

  const fetchPosts = useCallback(async () => {
    if (!targetUserId) return;
    const res = await CommunityService.listPosts({ page: 1, limit: 50, authorId: targetUserId });
    if (!res.success || !res.data) return;
    let items = res.data.items || [];
    // Hydrate liked posts for current viewer
    try {
      if (viewer?._id && items.length) {
        const likedRes = await CommunityService.getMyLikedPosts(items.map((p) => p._id));
        if (likedRes.success && likedRes.data) {
          const likedSet = new Set(likedRes.data);
          items = items.map((p) => ({ ...(p as any), _isLiked: likedSet.has(p._id) }));
        }
      }
    } catch {
      // ignore
    }
    // Only show private posts if the viewer is the owner of this wall
    const owned = !!(viewer?._id && viewer._id === targetUserId);
    if (!owned) {
      items = items.filter((p: any) => String((p.status ?? "")).toLowerCase() !== "private");
    }
    setPosts(items);
  }, [targetUserId, viewer?._id]);

  const fetchIsFollowing = useCallback(async () => {
    try {
      if (!viewer?._id || !profile?._id || viewer._id === profile._id) { setIsFollowing(false); return; }
      const res = await CommunityService.isFollowing(profile._id);
      if (res.success && typeof res.data === "boolean") setIsFollowing(res.data);
    } catch {
      setIsFollowing(false);
    }
  }, [viewer?._id, profile?._id]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      await fetchViewerMinimal();
      await fetchProfile();
    })()
      .finally(() => setLoading(false));
  }, [fetchViewerMinimal, fetchProfile]);

  useEffect(() => {
    void fetchIsFollowing();
  }, [fetchIsFollowing]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  // If URL has #post-<id>, scroll to it after posts are loaded
  useEffect(() => {
    if (!globalThis.window) return;
    const hash = globalThis.location.hash;
    if (hash?.startsWith('#post-')) {
      const el = globalThis.document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
      }
    }
  }, [posts.length]);

  const isSelf = useMemo(() => !!(viewer?._id && profile?._id && viewer._id === profile._id), [viewer?._id, profile?._id]);

  const featuredPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => {
      const aScore = (a.likesCount || 0) * 2 + (a.commentsCount || 0);
      const bScore = (b.likesCount || 0) * 2 + (b.commentsCount || 0);
      if (bScore !== aScore) return bScore - aScore;
      // tie-breaker: newer first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted.slice(0, 3);
  }, [posts]);

  const newestPosts = useMemo(() => {
    // History view: show all posts sorted by newest (including featured)
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  const handleToggleFollow = async () => {
    if (!profile?._id || !viewer?._id || isSelf) return;
    setFollowLoading(true);
    try {
      if (isFollowing) await CommunityService.unfollowUser(profile._id);
      else await CommunityService.followUser(profile._id);
      setIsFollowing((prev) => !prev);
      // Refresh profile counts
      await fetchProfile();
      // Also refresh viewer minimal so header (elsewhere) stays accurate if needed
      await fetchViewerMinimal();
    } catch (e) {
      // Log the error for diagnostics
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

   if (loading) {
    return (
      <div className="w-full">
        {/* Header gradient */}
        <div className="w-full h-32 bg-gradient-to-r from-rose-200 via-rose-300 to-rose-400" />
        
        <div className="max-w-4xl mx-auto -mt-8 px-4 space-y-5">
          {/* Profile skeleton */}
          <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
            <Skeleton className="w-16 h-16 rounded-full bg-rose-200" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40 bg-rose-200" />
              <div className="flex gap-3">
                <Skeleton className="h-4 w-16 bg-rose-200" />
                <Skeleton className="h-4 w-16 bg-rose-200" />
                <Skeleton className="h-4 w-16 bg-rose-200" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-md bg-rose-200" />
          </div>

          {/* PostCreator skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-rose-200" />
              <Skeleton className="h-16 flex-1 bg-rose-200" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-24 rounded-md bg-rose-200" />
            </div>
          </div>

          {/* FeaturedPosts skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <Skeleton className="h-5 w-32 bg-rose-200" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={`featured-skeleton-${i}`} className="h-40 w-full rounded-md bg-rose-200" />
              ))}
            </div>
          </div>

          {/* NewestPosts skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 bg-rose-200" />
            {Array.from({ length: 2 }, (_, i) => (
              <div key={`newest-skeleton-${i}`} className="bg-white rounded-xl shadow-sm p-4 space-y-2">
                <Skeleton className="h-4 w-1/3 bg-rose-200" />
                <Skeleton className="h-6 w-2/3 bg-rose-200" />
                <Skeleton className="h-40 w-full bg-rose-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full flex items-center justify-center py-16 text-gray-500">User not found</div>
    );
  }

  // Compute viewer minimal without a hook to avoid hook order changes across conditional renders
  const viewerMinimal: { _id?: string; fullName: string } = viewer
    ? { _id: viewer._id, fullName: viewer.fullName }
    : { fullName: "" };

  const scrollToPost = (id: string) => {
    const el = document.getElementById(`post-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Optional: update URL fragment
      try { history.replaceState(null, "", `#post-${id}`); } catch {}
    }
  };


  

  return (
    <div className="w-full text-[15px]">
      {/* Header gradient */}
  <div className="w-full h-32 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 fade-in" />

      {/* Profile summary card */}
      <div className="max-w-4xl mx-auto -mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-md p-3 flex items-center justify-between fade-in-up duration-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white -mt-6 mr-3 bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-lg font-semibold">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(profile.fullName)}</span>
              )}
            </div>
            <div>
              {/* Name + Verified */}
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{profile.fullName}</h2>
                {profile.role?.toUpperCase() === 'ARTIST' && (
                  <span className="relative group ml-1 cursor-pointer">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="inline-flex items-center justify-center rounded-full bg-rose-600 p-[0.2rem]"
                            aria-describedby={`artist-tip-${profile._id}`}
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
                {isSelf && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-rose-700 bg-rose-100 text-[11px] font-medium">
                    My Personal Wall
                  </span>
                )}
              </div>

              {/* Simple stats row like normal user */}
              <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900">{profile.followingsCount ?? 0}</span>
                  <span className="text-gray-500">Following</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900">{profile.followersCount ?? 0}</span>
                  <span className="text-gray-500">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900">{profile.postsCount ?? posts.length}</span>
                  <span className="text-gray-500">Posts</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isSelf && (
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium shadow-sm ${isFollowing ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                title={isFollowing ? "Unfollow" : "Follow"}
              >
                {isFollowing ? <UserCheck className="w-4 h-4 mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenMiniChat?.(profile._id)}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <MessageCircle className="w-4 h-4 mr-1" /> Message
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 my-5 min-h-[400px]">
        <div className="space-y-5">
          {isSelf && viewer && (
            <PostCreator
              postText={postText}
              setPostText={setPostText}
              privacy={privacy}
              setPrivacy={setPrivacy}
              posts={posts}
              setPosts={setPosts}
              currentUser={viewer}
              fetchMinimalUser={fetchViewerMinimal}
            />
          )}
          {profile.role?.toUpperCase() === 'ARTIST' && (
            <div className="bg-white rounded-xl shadow-sm p-3 fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-[15px]">Artist brief</h3>
              </div>
              {profile.muaBio ? (
                <p className="text-sm text-gray-700 whitespace-pre-line leading-6">{profile.muaBio}</p>
              ) : (
                <p className="text-sm text-gray-500">No bio provided.</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {typeof profile.muaBookingsCount === 'number' && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Completed {profile.muaBookingsCount}</span>
                )}
                {typeof profile.muaRatingAverage === 'number' && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Rating {profile.muaRatingAverage.toFixed(1)}</span>
                )}
                {profile.muaPortfolioUrl && (
                  <a
                    href={profile.muaPortfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 inline-flex items-center gap-1"
                    aria-label="Portfolio"
                    title="Portfolio"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          )}
          <FeaturedPosts featuredPosts={featuredPosts} onClickPost={scrollToPost} />
          <NewestPosts newestPosts={newestPosts} setPosts={setPosts} viewerMinimal={viewerMinimal} fetchViewerMinimal={fetchViewerMinimal} onOpenMiniChat={onOpenMiniChat} />
        </div>
      </div>
      {/* Local animations and scroll margin for anchors */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .fade-in { animation: fadeIn 300ms ease-out both }
        .fade-in-up { animation: fadeInUp 300ms ease-out both }
        [id^="post-"] { scroll-margin-top: 96px; }
      `}</style>
    </div>
  );
}
