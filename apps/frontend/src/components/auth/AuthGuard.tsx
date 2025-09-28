"use client";

import { UserResponseDTO } from "@/types/index";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { GeneralSkeleton } from "../generalUI/GeneralSkeleton";

interface AuthGuardProps {
  readonly children: ReactNode;
  readonly requiredRole?: string;
}

const PUBLIC_ROUTES = [
    "/", 
    "/user/about",
    "/user/artists/makeup-artist-list",
    "/user/artists/portfolio/[id]",
    "/user/community",
    ];

// Helper function để check dynamic routes
const isPublicRoute = (pathname: string): boolean => {
  // Check exact matches first
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Check dynamic routes
  for (const route of PUBLIC_ROUTES) {
    if (route.includes('[') && route.includes(']')) {
      // Convert dynamic patterns to regex
      let pattern = route
        .replace(/\[id\]/g, '[^/]+')        // [id] -> any non-slash chars
        .replace(/\[slug\]/g, '[^/]+')      // [slug] -> any non-slash chars  
        .replace(/\[...slug\]/g, '.*')      // [...slug] -> catch all
        .replace(/\[\[...slug\]\]/g, '.*'); // [[...slug]] -> optional catch all
      
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(pathname)) {
        return true;
      }
    }
  }

  return false;
};

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Reset states
      setLoading(true);
      setIsAuthorized(false);

      // Nếu route nằm trong PUBLIC_ROUTES thì bỏ qua check (bao gồm dynamic routes)
      if (isPublicRoute(pathname)) {
        console.log(`Public route detected: ${pathname}`);
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) {
        router.replace("/auth/login" as never);
        return;
      }

      try {
        const user: UserResponseDTO = JSON.parse(storedUser);

        if (requiredRole && user.role !== requiredRole) {
          router.replace("/access-denied" as never);
          return;
        }

        // Nếu tất cả đều OK, cho phép render
        setIsAuthorized(true);
      } catch (err) {
        console.error("Authentication error:", err);
        router.replace("/auth/login" as never);
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, requiredRole]);

  // Chỉ show loading khi đang check
  if (loading) {
    return <GeneralSkeleton />;
  }

  // Chỉ render children khi đã được authorize
  if (!isAuthorized) {
    return <GeneralSkeleton />;
  }

  return <>{children}</>;
}
