import ResetForm from "@/components/auth/forgot-email/ResetForm";
import { GeneralSkeleton } from "@/components/generalUI/GeneralSkeleton";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto  max-w-md px-4 py-10">
      <Suspense fallback={<GeneralSkeleton />}>
        <ResetForm />
      </Suspense>
    </main>
  );
}


