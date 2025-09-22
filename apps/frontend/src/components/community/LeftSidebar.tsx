"use client";
import { Users } from "lucide-react";
import { PostResponseDTO, TagResponseDTO, UserWallResponseDTO } from "@/types/community.dtos";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CommunityService } from "@/services/community";
import { FilterState } from "./MainContent";

interface LeftSidebarProps {
  userWalls: UserWallResponseDTO[]; // 🆕 danh sách user walls để hiển thị ở StoriesSectio
  setUserWalls: React.Dispatch<React.SetStateAction<UserWallResponseDTO[]>>;
  posts: PostResponseDTO[];
  setPosts: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>;
  currentUser: UserWallResponseDTO;  // 🆕 từ MainContent truyền vào
  trendingTags: TagResponseDTO[];
  fetchPosts: () => Promise<void>;
  fetchActiveMuas: () => Promise<void>;
  activeFilter: FilterState;                          // 🆕 dùng từ parent
  setActiveFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function LeftSidebar({
  userWalls,
  setUserWalls,
  posts,
  setPosts,
  currentUser,
  trendingTags,
  fetchPosts,
  fetchActiveMuas,
  activeFilter,
  setActiveFilter,
}: Readonly<LeftSidebarProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track which nav is active locally: 'feed' | 'following' | 'none'
  const [navActive, setNavActive] = useState<"feed" | "following" | "none">("feed");

  // Derive if we are on any SocialWall (own or others) and specifically on my wall
  const { isOnAnyWall, isOnMyWall } = useMemo(() => {
    const wallId = searchParams?.get("wall");
    const myId = String(currentUser?._id || "");
    return {
      isOnAnyWall: Boolean(wallId),
      isOnMyWall: wallId === myId && !!myId,
    };
  }, [currentUser?._id, searchParams]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  // Helpers to keep URL and data logic tidy
  const pushUrl = useCallback((mutate: (sp: URLSearchParams) => void) => {
    try {
      const sp = new URLSearchParams(searchParams?.toString());
      mutate(sp);
      const qs = sp.toString();
      router.push((qs ? `${pathname}?${qs}` : pathname) as any, { scroll: false });
    } catch {
      // ignore
    }
  }, [pathname, router, searchParams]);

  const clearWallParams = useCallback(() => {
    pushUrl((sp) => {
      sp.delete("wall");
      sp.delete("wn");
    });
  }, [pushUrl]);

  const fetchPostsByTag = useCallback(async (tag: string) => {
    const res = await CommunityService.getPostsByTag(tag, { page: 1, limit: 10 });
    if (res.success && res.data) return res.data.items;
    return null;
  }, []);

  const hydrateLiked = useCallback(async (items: PostResponseDTO[]) => {
    try {
      if (currentUser && items.length) {
        const likedRes = await CommunityService.getMyLikedPosts(items.map((p) => p._id));
        if (likedRes.success && likedRes.data) {
          const likedSet = new Set(likedRes.data);
          return items.map((p) => ({ ...(p as any), _isLiked: likedSet.has(p._id) }));
        }
      }
    } catch {
      // ignore errors (unauthenticated or request failed)
    }
    return items;
  }, [currentUser]);

  const handleTagClick = useCallback(async (tag: string) => {
    // Close SocialWall if open so filtered feed is visible
    clearWallParams();

    // Toggle off if the same tag was active
    if (activeFilter.type === "tag" && activeFilter.value === tag) {
      setActiveFilter({ type: null });
      await fetchPosts();
      return;
    }
    const items = await fetchPostsByTag(tag);
    if (!items) return;
    const hydrated = await hydrateLiked(items);
    setPosts(hydrated);
    setActiveFilter({ type: "tag", value: tag });
  }, [activeFilter, clearWallParams, fetchPosts, fetchPostsByTag, hydrateLiked, setActiveFilter, setPosts]);

  const handleOpenMyWall = useCallback(() => {
    try {
      const sp = new URLSearchParams(searchParams?.toString());
      sp.set("wall", String(currentUser._id))
      if (currentUser.fullName) sp.set("wn", currentUser.fullName);
      else sp.delete("wn");
      const qs = sp.toString();
      router.push((qs ? `${pathname}?${qs}` : pathname) as any, { scroll: false });
      // When opening my wall, release nav highlights immediately
      setNavActive("none");
    } catch {
      // ignore
    }
  }, [currentUser._id, currentUser.fullName, pathname, router, searchParams]);

  const handleGoFeed = useCallback(async () => {
    // Clear SocialWall params and reset filter to default feed
    try {
      const sp = new URLSearchParams(searchParams?.toString());
      sp.delete("wall");
      sp.delete("wn");
      const qs = sp.toString();
      router.push((qs ? `${pathname}?${qs}` : pathname) as any, { scroll: false });
    } catch {
      // ignore
    }
    setActiveFilter({ type: null });
    setNavActive("feed");
    await fetchActiveMuas();
    await fetchPosts();
  }, [fetchActiveMuas, fetchPosts, pathname, router, searchParams, setActiveFilter]);

 const fetchFollowingUsers = useCallback(async () => {
    const res = await CommunityService.getFollowingUsers(10);
    if (res.success && res.data) {
      setUserWalls(res.data || []);
    }
  }, [setUserWalls]);
  const fetchPostOfFollowingUser = useCallback(async ()=>{
    const res = await CommunityService.getPostsByFollowingUsers({page:1, limit:10});
    if (res.success && res.data) {
      const hydrated = await hydrateLiked(res.data.items);
      setPosts(hydrated);
    }
  }, [hydrateLiked, setPosts]);

 const handleGoFollowingFeed = useCallback(async () => {
    // Clear SocialWall params and reset filter to default feed
    try {
      // Ensure SocialWall is closed so feed is visible
      clearWallParams();
      await fetchFollowingUsers();
      await fetchPostOfFollowingUser();
      } catch {
      // ignore
    }
    setActiveFilter({ type: null });
    setNavActive("following");
  }, [clearWallParams, fetchFollowingUsers, fetchPostOfFollowingUser, setActiveFilter]);

  return (
    <div className="w-64 bg-white h-screen sticky top-0 border-r border-gray-200 p-4">
      {/* Profile */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={handleOpenMyWall}
          className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-white bg-gradient-to-br from-rose-500 to-rose-700 ${isOnMyWall ? "ring-2 ring-rose-400" : ""}`}
        >
          <span className="text-white font-semibold">
            {getInitials(currentUser.fullName)}
          </span>
        </button>
        <div className="ml-3">
          <button type="button" onClick={handleOpenMyWall} className="font-semibold text-gray-900 hover:underline">
            {currentUser.fullName}
          </button>
          <p className="text-sm text-gray-500">@{currentUser.fullName}</p>
          {isOnMyWall && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              My Personal Wall
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between mb-6 text-center">
        <div>
          <div className="font-semibold text-gray-900">{currentUser.followersCount}</div>
          <div className="text-xs text-gray-500">Follower</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{currentUser.followingsCount}</div>
          <div className="text-xs text-gray-500">Following</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{currentUser.postsCount}</div>
          <div className="text-xs text-gray-500">Post</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <button
          type="button"
          onClick={handleGoFeed}
          className={`flex items-center w-full text-left px-3 py-2 rounded-lg ${!isOnAnyWall && navActive === "feed" ? "text-white bg-rose-600" : "text-gray-800 hover:bg-gray-100"}`}
        >
          <Users className="w-5 h-5 mr-3" /> Feed
        </button>
        <button
          type="button"
          onClick={handleGoFollowingFeed}
          className={`flex items-center w-full px-3 py-2 rounded-lg ${!isOnAnyWall && navActive === "following" ? "text-white bg-rose-600" : "text-gray-800 hover:bg-gray-100"}`}
        >
          <Users className="w-5 h-5 mr-3" /> Following Users
        </button>
      </nav>

      {/* Trending Tags */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-gray-500 mb-3">TRENDING TAGS</h4>
        <div className="space-y-3">
          {trendingTags.map((tag) => (
            <button
              key={tag._id}
              type="button"
              onClick={() => handleTagClick(tag.name)}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeFilter.type === "tag" && activeFilter.value === tag.name
                  ? "bg-rose-100 text-gray-900"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="ml-3 text-sm">#{tag.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
