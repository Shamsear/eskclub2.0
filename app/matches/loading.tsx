// Dark-themed loading skeleton for /matches listing page
export default function MatchesLoading() {
    return (
        <div className="min-h-screen" style={{ background: '#0D0D0D' }}>
            {/* Hero skeleton */}
            <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: 'linear-gradient(180deg,#0D0D0D 0%,#110800 100%)' }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-40" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-pulse">
                    <div className="inline-flex mb-5">
                        <div className="h-7 w-36 rounded-full bg-[#1A1A1A]" />
                    </div>
                    <div className="flex justify-center mb-4">
                        <div className="h-14 w-72 rounded-xl" style={{ background: 'rgba(255,102,0,0.08)' }} />
                    </div>
                    <div className="flex justify-center">
                        <div className="h-4 w-96 rounded bg-[#1A1A1A]" />
                    </div>
                </div>
            </div>

            {/* Match card skeletons */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-[#1E1E1E] overflow-hidden animate-pulse" style={{ background: '#111' }}>
                        {/* Header bar */}
                        <div className="h-10 w-full" style={{ background: 'rgba(255,102,0,0.12)' }} />
                        {/* Body */}
                        <div className="p-4 sm:p-5 flex items-center gap-4">
                            {/* Player 1 */}
                            <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-[#1A1A1A]" style={{ background: '#0D0D0D' }}>
                                <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                                <div className="flex-1">
                                    <div className="h-4 w-24 rounded mb-2" style={{ background: '#1A1A1A' }} />
                                    <div className="h-3 w-16 rounded" style={{ background: '#151515' }} />
                                </div>
                                <div className="h-9 w-7 rounded" style={{ background: '#1A1A1A' }} />
                            </div>
                            {/* VS */}
                            <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                            {/* Player 2 */}
                            <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-[#1A1A1A] flex-row-reverse" style={{ background: '#0D0D0D' }}>
                                <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                                <div className="flex-1 text-right">
                                    <div className="h-4 w-24 rounded mb-2 ml-auto" style={{ background: '#1A1A1A' }} />
                                    <div className="h-3 w-16 rounded ml-auto" style={{ background: '#151515' }} />
                                </div>
                                <div className="h-9 w-7 rounded" style={{ background: '#1A1A1A' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
