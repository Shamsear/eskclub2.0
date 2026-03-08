// Dark-themed loading skeleton for /tournaments listing page
export default function TournamentsLoading() {
    return (
        <div className="min-h-screen" style={{ background: '#0D0D0D' }}>
            {/* Hero skeleton */}
            <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: 'linear-gradient(180deg,#0D0D0D 0%,#110800 100%)' }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-40" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-pulse">
                    <div className="inline-flex mb-5">
                        <div className="h-7 w-44 rounded-full bg-[#1A1A1A]" />
                    </div>
                    <div className="flex justify-center mb-4">
                        <div className="h-14 w-80 rounded-xl" style={{ background: 'rgba(255,102,0,0.08)' }} />
                    </div>
                    <div className="flex justify-center">
                        <div className="h-4 w-96 rounded bg-[#1A1A1A]" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Search bar */}
                <div className="h-12 w-full rounded-xl mb-6 bg-[#111] border border-[#1E1E1E] animate-pulse" />

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cards grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="rounded-2xl border border-[#1E1E1E] overflow-hidden animate-pulse" style={{ background: '#111' }}>
                                    <div className="h-px w-full" style={{ background: 'rgba(255,102,0,0.15)' }} />
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="h-5 w-3/4 rounded" style={{ background: '#1A1A1A' }} />
                                            <div className="h-5 w-16 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                                        </div>
                                        <div className="h-3 w-40 rounded mb-3" style={{ background: '#151515' }} />
                                        <div className="flex gap-4 mb-5">
                                            <div className="h-4 w-24 rounded" style={{ background: '#151515' }} />
                                            <div className="h-4 w-20 rounded" style={{ background: '#151515' }} />
                                        </div>
                                        <div className="pt-4 border-t border-[#1A1A1A]">
                                            <div className="h-4 w-32 rounded" style={{ background: '#1A1A1A' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filter sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="rounded-2xl border border-[#1E1E1E] p-5 animate-pulse" style={{ background: '#111' }}>
                            <div className="h-5 w-20 rounded mb-5" style={{ background: '#1A1A1A' }} />
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-9 w-full rounded-lg" style={{ background: '#151515' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
