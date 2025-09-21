import { Users } from "lucide-react";
import type { User } from "./community.types";
import { PostResponseDTO, TagResponseDTO } from "@/types/community.dtos";
import { useCallback } from "react";
import { CommunityService } from "@/services/community";
import { FilterState } from "./MainContent";

interface LeftSidebarProps {
  posts: PostResponseDTO[];
  setPosts: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>;
  currentUser: User;
  trendingTags: TagResponseDTO[];
  fetchPosts: () => Promise<void>;
  activeFilter: FilterState;                          // 🆕 dùng từ parent
  setActiveFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function LeftSidebar({
  posts,
  setPosts,
  currentUser,
  trendingTags,
  fetchPosts,
  activeFilter,
  setActiveFilter,
}: Readonly<LeftSidebarProps>) {

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleTagClick = useCallback(
    async (tag: string) => {
      if (activeFilter.type === "tag" && activeFilter.value === tag) {
        // if clicking the same active tag → reset
        setActiveFilter({ type: null });
        await fetchPosts();
      } else {
        try {
          const res = await CommunityService.getPostsByTag(tag, {
            page: 1,
            limit: 10,
          });
          if (res.success && res.data) {
            setPosts(res.data.items);
            setActiveFilter({ type: "tag", value: tag }); // update parent
          }
        } catch {
          console.error("Failed to fetch posts by tag:", tag);
        }
      }
    },
    [activeFilter, setPosts, fetchPosts, setActiveFilter]
  );

  return (
    <div className="w-64 bg-white h-screen sticky top-0 border-r border-gray-200 p-4">
      {/* Profile */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {getInitials(currentUser.fullName)}
          </span>
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-gray-900">{currentUser.fullName}</h3>
          <p className="text-sm text-gray-500">@{currentUser.username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between mb-6 text-center">
        <div>
          <div className="font-semibold text-gray-900">{currentUser.followerCount}</div>
          <div className="text-xs text-gray-500">Follower</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{currentUser.followingCount}</div>
          <div className="text-xs text-gray-500">Following</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{currentUser.postCount}</div>
          <div className="text-xs text-gray-500">Post</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <button type="button" className="flex items-center w-full text-left px-3 py-2 text-white bg-rose-600 rounded-lg">
          <Users className="w-5 h-5 mr-3" /> Feed
        </button>
        <button type="button" className="flex items-center w-full px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
          <Users className="w-5 h-5 mr-3" /> Following Users
        </button>
        <button type="button" className="flex items-center w-full px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
          <Users className="w-5 h-5 mr-3" /> Following Artists
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
