"use client";

import { useRouter } from 'next/navigation';

interface TournamentFilterProps {
  currentTournamentId?: string;
  tournaments: Array<{ id: number; name: string }>;
  leaderboardType: 'players' | 'teams';
}

export default function TournamentFilter({ 
  currentTournamentId, 
  tournaments,
  leaderboardType 
}: TournamentFilterProps) {
  const router = useRouter();

  const handleTabClick = (tournamentId?: number) => {
    if (tournamentId) {
      router.push(`/leaderboard/${leaderboardType}?tournament=${tournamentId}`);
    } else {
      router.push(`/leaderboard/${leaderboardType}`);
    }
  };

  const isActive = (tournamentId?: number) => {
    if (!tournamentId && !currentTournamentId) return true;
    return currentTournamentId === String(tournamentId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {/* Overall Tab */}
        <button
          onClick={() => handleTabClick()}
          className={`flex-shrink-0 px-6 py-4 font-semibold text-sm transition-all border-b-4 ${
            isActive()
              ? 'border-[#FF6600] text-[#FF6600] bg-[#FFB700]/10'
              : 'border-transparent text-gray-600 hover:text-[#FF6600] hover:bg-gray-50'
          }`}
        >
          Overall
        </button>

        {/* Tournament Tabs */}
        {tournaments.map((tournament) => (
          <button
            key={tournament.id}
            onClick={() => handleTabClick(tournament.id)}
            className={`flex-shrink-0 px-6 py-4 font-semibold text-sm transition-all border-b-4 whitespace-nowrap ${
              isActive(tournament.id)
                ? 'border-[#FF6600] text-[#FF6600] bg-[#FFB700]/10'
                : 'border-transparent text-gray-600 hover:text-[#FF6600] hover:bg-gray-50'
            }`}
          >
            {tournament.name}
          </button>
        ))}
      </div>
    </div>
  );
}
