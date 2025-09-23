import MainContent from "@/components/community/MainContent";
import { GeneralSkeleton } from "@/components/generalUI/GeneralSkeleton";
import { Suspense } from "react";

export default function CommunityPage() {
  return (
    <Suspense fallback={<GeneralSkeleton />}>
      <MainContent />
    </Suspense>
  );
}


