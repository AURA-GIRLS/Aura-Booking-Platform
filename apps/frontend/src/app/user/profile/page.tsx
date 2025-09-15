"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to edit-profile as the default profile page
    router.replace("/user/profile/edit-profile");
  }, [router]);

  return null;
}
