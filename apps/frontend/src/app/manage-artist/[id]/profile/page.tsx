"use client";

import EditProfile from "@/components/profile/EditProfile";

export default function ManageArtistProfilePage() {
  // We intentionally reuse the existing EditProfile component
  // which already handles fetching/saving the current user's profile
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <EditProfile />
      </div>
    </div>
  );
}
