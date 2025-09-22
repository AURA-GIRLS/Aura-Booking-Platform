import VerifyEmail from "@/components/auth/register/VerifyEmail";
import { GeneralSkeleton } from "@/components/generalUI/GeneralSkeleton";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
        <main className="mx-auto max-w-md px-4 py-10">
      <Suspense fallback={<GeneralSkeleton />}>
        <VerifyEmail />
      </Suspense>
    </main>
  );
}
