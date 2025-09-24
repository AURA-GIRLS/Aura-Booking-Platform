import { Skeleton } from "../lib/ui/skeleton";

export function GeneralSkeleton() {
  return (
     <div className="w-full rounded-3xl bg-white/80 backdrop-blur-md px-8 py-10 flex flex-col gap-6 ">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 bg-rose-100" />
        <Skeleton className="h-4 w-60 bg-rose-100" />
        <Skeleton className="h-4 w-52 bg-rose-100" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg bg-rose-100" />
      <Skeleton className="h-10 w-2/3 rounded-lg bg-rose-100" />
    </div>
  );
}