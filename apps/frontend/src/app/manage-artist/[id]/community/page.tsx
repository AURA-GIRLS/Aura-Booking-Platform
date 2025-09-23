import MainContent from "@/components/community/MainContent";
import { GeneralSkeleton } from "@/components/generalUI/GeneralSkeleton";
import { Suspense } from "react";

export default function ArtistCommunityPage({ params }: { readonly params: { id: string } }) {
    return (
       <Suspense fallback={<GeneralSkeleton />}>
            <MainContent />
          </Suspense>
     );
}