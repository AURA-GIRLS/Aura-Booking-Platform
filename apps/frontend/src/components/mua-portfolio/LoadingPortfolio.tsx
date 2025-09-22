import { Skeleton } from "@/components/lib/ui/skeleton"

export default function LoadingPortfolio() {
    return (
         <main className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-br from-rose-50 to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8 animate-pulse">
          {/* Profile image */}
          <div className="lg:w-[26rem] p-6">
            <div className="w-full h-[22rem] bg-rose-100 rounded-lg border-2 border-rose-200"></div>
          </div>

          {/* Profile details */}
          <div className="flex-1 p-6 lg:p-8 space-y-4">
            <div className="h-6 w-40 bg-rose-100 rounded"></div>
            <div className="h-4 w-60 bg-rose-100 rounded"></div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="h-12 bg-rose-100 rounded"></div>
              <div className="h-12 bg-rose-100 rounded"></div>
              <div className="h-12 bg-rose-100 rounded"></div>
            </div>
            <div className="h-24 bg-rose-100 rounded"></div>
            <div className="flex gap-4 mt-6">
              <div className="h-10 w-32 bg-rose-100 rounded"></div>
              <div className="h-10 w-32 bg-rose-100 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Skeleton */}
      <section className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-center py-4 gap-8 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 w-20 bg-rose-100 rounded"></div>
          ))}
        </div>
      </section>

      {/* Services Section Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 space-y-4 animate-pulse">
            <div className="h-6 w-64 bg-rose-100 mx-auto rounded"></div>
            <div className="h-4 w-80 bg-rose-100 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-rose-100 rounded-lg border border-rose-200"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section Skeleton */}
      <section className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 space-y-4 animate-pulse">
            <div className="h-6 w-64 bg-rose-100 mx-auto rounded"></div>
            <div className="h-4 w-80 bg-rose-100 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-rose-100 rounded-lg border border-rose-200"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section Skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 space-y-4 animate-pulse">
            <div className="h-6 w-64 bg-rose-100 mx-auto rounded"></div>
            <div className="h-4 w-80 bg-rose-100 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-rose-100 rounded-lg border border-rose-200"></div>
            ))}
          </div>
        </div>
      </section>
    </main>
    )
}