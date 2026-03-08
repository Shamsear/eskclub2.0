'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TournamentJourneyMap from './TournamentJourneyMap';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface TournamentDetailData {
  tournament: {
    id: number;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    club: { id: number; name: string; logo: string | null } | null;
    pointSystem: {
      pointsPerWin: number;
      pointsPerDraw: number;
      pointsPerLoss: number;
      pointsPerGoalScored: number;
      pointsPerGoalConceded: number;
    };
  };
  stages: Array<{ id: number; name: string; order: number; matchCount: number }>;
  stats: { totalMatches: number; completedMatches: number; totalGoals: number; participantCount: number };
}

interface TournamentDetailClientProps {
  initialData: TournamentDetailData;
  tournamentId: number;
}

/* ──────────────────── shared dark stat card ──────────────────── */
function DarkStatCard({ icon, value, label, accent = '#FF6600' }: { icon: React.ReactNode; value: React.ReactNode; label: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] p-5 text-center hover:-translate-y-1 transition-all duration-300" style={{ background: '#111' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `linear-gradient(135deg,${accent},${accent}99)` }}>
        {icon}
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-xs text-[#555] font-medium uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function TournamentDetailClient({ initialData, tournamentId }: TournamentDetailClientProps) {
  const router = useRouter();
  const { tournament, stages, stats } = initialData;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatus = (): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    const end = tournament.endDate ? new Date(tournament.endDate) : null;
    if (start > now) return 'upcoming';
    if (!end || end >= now) return 'active';
    return 'completed';
  };

  const status = getStatus();
  const completionPct = stats.totalMatches > 0 ? Math.round((stats.completedMatches / stats.totalMatches) * 100) : 0;

  const statusStyle = {
    upcoming: { bg: 'rgba(59,130,246,0.15)', border: '#3B82F6', text: '#93C5FD', label: 'Upcoming' },
    active: { bg: 'rgba(34,197,94,0.15)', border: '#22C55E', text: '#86EFAC', label: 'Active' },
    completed: { bg: 'rgba(107,114,128,0.15)', border: '#6B7280', text: '#D1D5DB', label: 'Completed' },
  }[status];

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Hero */}
      <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: "linear-gradient(180deg,#0D0D0D 0%,#110800 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,183,0,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#FF6600,transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFB700]/30 to-transparent" />

        {/* Breadcrumb */}
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-[#555]">
            <li><Link href="/" className="hover:text-[#FFB700] transition-colors">Home</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li><Link href="/tournaments" className="hover:text-[#FFB700] transition-colors">Tournaments</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li className="text-[#FFB700] font-semibold truncate max-w-[200px]">{tournament.name}</li>
          </ol>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border mb-5"
                style={{ background: statusStyle.bg, borderColor: statusStyle.border, color: statusStyle.text }}>
                {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                {statusStyle.label}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight font-['Outfit',sans-serif]">
                {tournament.name}
              </h1>

              {tournament.description && (
                <p className="text-[#707070] text-base leading-relaxed mb-6 max-w-2xl">{tournament.description}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
                <svg className="w-4 h-4 text-[#FF6600] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(tournament.startDate)}{tournament.endDate && ` — ${formatDate(tournament.endDate)}`}</span>
              </div>
            </div>

            {tournament.club && (
              <div onClick={() => router.push(`/clubs/${tournament.club?.id}`)}
                className="inline-flex items-center gap-4 px-5 py-4 rounded-2xl border border-[#1E1E1E] hover:border-[#FF6600]/40 transition-all cursor-pointer group"
                style={{ background: '#111' }}>
                {tournament.club.logo ? (
                  <div className="w-14 h-14 rounded-xl border border-[#FF6600]/30 overflow-hidden bg-[#0D0D0D] flex-shrink-0">
                    <OptimizedImage src={tournament.club.logo} alt={tournament.club.name} width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>
                    <span className="text-xl font-black text-white">{tournament.club.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <div className="text-xs text-[#555] mb-0.5">Organized by</div>
                  <div className="font-bold text-white group-hover:text-[#FFB700] transition-colors">{tournament.club.name}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DarkStatCard accent="#FF6600" value={stats.participantCount} label="Participants"
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <DarkStatCard accent="#FFB700" value={stats.totalMatches} label="Total Matches"
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <DarkStatCard accent="#22C55E" value={stats.completedMatches} label="Completed"
            icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <DarkStatCard accent="#CC2900" value={stats.totalGoals} label="Total Goals"
            icon={<span className="text-xl">⚽</span>}
          />
        </div>
      </div>

      {/* Progress Bar */}
      {stats.totalMatches > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="rounded-2xl border border-[#1E1E1E] p-6" style={{ background: '#111' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Tournament Progress</h3>
                <p className="text-xs text-[#555] mt-0.5">{stats.completedMatches} of {stats.totalMatches} matches completed</p>
              </div>
              <div className="text-3xl font-black" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {completionPct}%
              </div>
            </div>
            <div className="h-3 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPct}%`, background: "linear-gradient(90deg,#FF6600,#FFB700,#CC2900)" }}
                role="progressbar" aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100} />
            </div>
          </div>
        </div>
      )}

      {/* Tournament Journey */}
      {stages.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
            <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">Tournament Journey</h2>
          </div>
          <TournamentJourneyMap stages={stages} tournamentId={tournamentId} />
        </div>
      )}

      {/* Point System */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-2xl border border-[#1E1E1E] p-6 sm:p-8" style={{ background: '#111' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#FF6600,#CC2900)" }} />
            <div>
              <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">Point System</h2>
              <p className="text-xs text-[#555] mt-0.5">How points are awarded in this tournament</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Win', value: `${tournament.pointSystem.pointsPerWin}`, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
              { label: 'Draw', value: `${tournament.pointSystem.pointsPerDraw}`, color: '#EAB308', bg: 'rgba(234,179,8,0.08)' },
              { label: 'Loss', value: `${tournament.pointSystem.pointsPerLoss}`, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
              { label: 'Goal Scored', value: `+${tournament.pointSystem.pointsPerGoalScored}`, color: '#FF6600', bg: 'rgba(255,102,0,0.08)' },
              { label: 'Goal Conceded', value: `${tournament.pointSystem.pointsPerGoalConceded}`, color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="rounded-xl p-5 border hover:-translate-y-0.5 transition-all duration-200 text-center"
                style={{ background: bg, borderColor: `${color}30` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>{label}</div>
                <div className="text-3xl font-black" style={{ color }}>{value}</div>
                <div className="text-xs mt-1" style={{ color: `${color}80` }}>points</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href={`/tournaments/${tournamentId}/leaderboard`}
            className="group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-white text-base transition-all"
            style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)", boxShadow: "0 4px 20px rgba(255,102,0,0.3)" }}>
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <svg className="w-5 h-5 relative" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            <span className="relative">View Leaderboard</span>
          </Link>
          <Link href={`/tournaments/${tournamentId}/matches`}
            className="group flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-white text-base border border-[#FF6600]/40 hover:border-[#FF6600] transition-all"
            style={{ background: '#111' }}>
            <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="group-hover:text-[#FFB700] transition-colors">View All Matches</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
