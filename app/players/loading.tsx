// Dark-themed loading skeleton for /players listing page
export default function PlayersLoading() {
    return (
        <div className="min-h-screen" style={{ background: '#0D0D0D' }}>
            {/* Hero skeleton */}
            <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: 'linear-gradient(180deg,#0D0D0D 0%,#110800 100%)' }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-40" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-pulse">
                    <div className="inline-flex mb-5">
                        <div className="h-7 w-32 rounded-full bg-[#1A1A1A]" />
                    </div>
                    <div className="flex justify-center mb-4">
                        <div className="h-14 w-64 rounded-xl" style={{ background: 'rgba(255,102,0,0.08)' }} />
                    </div>
                    <div className="flex justify-center">
                        <div className="h-4 w-80 rounded bg-[#1A1A1A]" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Search bar */}
                <div className="h-12 w-full rounded-xl mb-6 bg-[#111] border border-[#1E1E1E] animate-pulse" />

                {/* Player cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-[#1E1E1E] p-5 animate-pulse" style={{ background: '#111' }}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                                <div className="flex-1">
                                    <div className="h-5 w-28 rounded mb-2" style={{ background: '#1A1A1A' }} />
                                    <div className="h-3 w-20 rounded" style={{ background: '#151515' }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1A1A1A]">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="text-center">
                                        <div className="h-5 w-8 rounded mx-auto mb-1" style={{ background: '#1A1A1A' }} />
                                        <div className="h-3 w-10 rounded mx-auto" style={{ background: '#151515' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
