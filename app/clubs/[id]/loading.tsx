// Dark-themed loading skeleton for /clubs/[id] profile page
export default function ClubDetailLoading() {
    return (
        <div className="min-h-screen" style={{ background: '#0D0D0D' }}>
            {/* Hero skeleton */}
            <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: 'linear-gradient(180deg,#0D0D0D 0%,#110800 100%)' }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-40" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-3 w-12 rounded bg-[#1E1E1E]" />
                        <div className="h-3 w-2 rounded bg-[#1A1A1A]" />
                        <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,102,0,0.2)' }} />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Logo */}
                        <div className="w-28 h-28 rounded-full flex-shrink-0 border-2 border-[#1E1E1E]" style={{ background: '#1A1A1A' }} />
                        <div className="flex-1 text-center sm:text-left pt-2">
                            <div className="h-9 w-52 rounded mb-3 mx-auto sm:mx-0" style={{ background: 'rgba(255,102,0,0.1)' }} />
                            <div className="h-4 w-64 rounded mb-5 mx-auto sm:mx-0" style={{ background: '#1A1A1A' }} />
                            <div className="flex gap-3 justify-center sm:justify-start">
                                <div className="h-8 w-28 rounded-xl" style={{ background: '#1A1A1A' }} />
                                <div className="h-8 w-28 rounded-xl" style={{ background: '#1A1A1A' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-2xl border border-[#1E1E1E] p-5 text-center" style={{ background: '#111' }}>
                            <div className="h-3 w-16 rounded mx-auto mb-3" style={{ background: '#1E1E1E' }} />
                            <div className="h-8 w-12 rounded mx-auto" style={{ background: '#1A1A1A' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Player roster skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 animate-pulse">
                <div className="h-6 w-36 rounded mb-5" style={{ background: '#1A1A1A' }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-[#1E1E1E] p-4" style={{ background: '#111' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: '#1A1A1A' }} />
                                <div className="flex-1">
                                    <div className="h-4 w-28 rounded mb-2" style={{ background: '#1A1A1A' }} />
                                    <div className="h-3 w-16 rounded" style={{ background: '#151515' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
