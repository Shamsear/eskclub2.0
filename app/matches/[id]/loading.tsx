import { MatchTheaterSkeleton } from '@/components/public/PublicSkeletons';

export default function MatchDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden py-12 sm:py-16" style={{ background: 'linear-gradient(180deg,#0D0D0D 0%,#110800 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,183,0,0.08) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-3 w-16 rounded bg-[#1E1E1E]" />
            <div className="h-3 w-2 rounded bg-[#1A1A1A]" />
            <div className="h-3 w-28 rounded bg-[#1E1E1E]" />
            <div className="h-3 w-2 rounded bg-[#1A1A1A]" />
            <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,102,0,0.2)' }} />
          </div>
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div className="h-7 w-36 rounded-full bg-[#1E1E1E]" />
          </div>
          {/* Title */}
          <div className="flex justify-center mb-3">
            <div className="h-12 w-72 rounded-xl" style={{ background: 'rgba(255,102,0,0.1)' }} />
          </div>
          {/* Sub */}
          <div className="flex justify-center mb-5">
            <div className="h-4 w-48 rounded bg-[#1A1A1A]" />
          </div>
          {/* Pills */}
          <div className="flex justify-center gap-3">
            <div className="h-9 w-44 rounded-xl bg-[#1E1E1E]" />
            <div className="h-9 w-28 rounded-xl bg-[#1E1E1E]" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-[#1E1E1E] p-5 text-center" style={{ background: '#111' }}>
              <div className="h-3 w-20 rounded bg-[#1E1E1E] mx-auto mb-3" />
              <div className="h-8 w-10 rounded bg-[#1A1A1A] mx-auto mb-2" />
              <div className="h-8 w-14 rounded bg-[#1A1A1A] mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Performance cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6 animate-pulse">
          <div className="w-1 h-8 rounded-full" style={{ background: 'rgba(255,102,0,0.3)' }} />
          <div className="h-6 w-44 rounded bg-[#1E1E1E]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-[#1E1E1E] overflow-hidden" style={{ background: '#111' }}>
              {/* Outcome banner */}
              <div className="h-16 bg-[#1A1A1A]" />
              <div className="p-5">
                {/* Club */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1A1A1A]">
                  <div className="w-10 h-10 rounded-lg bg-[#1A1A1A]" />
                  <div className="h-5 w-32 rounded bg-[#1E1E1E]" />
                </div>
                {/* Players */}
                <div className="space-y-3 mb-5">
                  <div className="h-3 w-20 rounded bg-[#1A1A1A] mb-2" />
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex-shrink-0" />
                      <div className="h-4 w-28 rounded bg-[#1E1E1E]" />
                    </div>
                  ))}
                </div>
                {/* Stats */}
                <div className="space-y-2">
                  {[1, 2, 3].map((k) => (
                    <div key={k} className="flex justify-between items-center py-1.5 border-b border-[#1A1A1A]">
                      <div className="h-3 w-24 rounded bg-[#1A1A1A]" />
                      <div className="h-5 w-6 rounded bg-[#1E1E1E]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
