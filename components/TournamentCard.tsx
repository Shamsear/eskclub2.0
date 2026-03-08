'use client';

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TournamentCardProps {
  tournament: {
    id: number;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    _count: {
      participants: number;
      matches: number;
    };
  };
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const router = useRouter();
  
  // Determine tournament status
  const getStatus = () => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    const end = tournament.endDate ? new Date(tournament.endDate) : null;
    
    if (now < start) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (end && now > end) {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { label: 'Ongoing', color: 'bg-green-100 text-green-800' };
    }
  };
  
  const status = getStatus();
  
  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleCardClick = () => {
    router.push(`/dashboard/tournaments/${tournament.id}`);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-violet-300 transition-all duration-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Status Badge - Left Side */}
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center shadow-md ${
            status.label === 'Upcoming' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
            status.label === 'Ongoing' ? 'bg-gradient-to-br from-green-500 to-green-600' : 
            'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            <div className="text-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-[10px] font-bold text-white uppercase">{status.label}</span>
            </div>
          </div>
        </div>

        {/* Tournament Info - Center - Clickable */}
        <Link href={`/dashboard/tournaments/${tournament.id}`} className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors truncate">
            {tournament.name}
          </h3>
          {tournament.description && (
            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-1">
              {tournament.description}
            </p>
          )}
          
          {/* Stats - Responsive */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-600">
                {formatDate(tournament.startDate)}
                {tournament.endDate && ` - ${formatDate(tournament.endDate)}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">
                <span className="font-bold text-gray-900">{tournament._count.participants}</span> Participants
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">
                <span className="font-bold text-gray-900">{tournament._count.matches}</span> Matches
              </span>
            </div>
          </div>
        </Link>

        {/* Actions - Right Side / Bottom on Mobile */}
        <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
          <Link href={`/dashboard/tournaments/${tournament.id}/edit`} className="flex-1 sm:flex-none">
            <button className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
          </Link>
          <Link href={`/dashboard/tournaments/${tournament.id}`} className="flex-1 sm:flex-none">
            <button className="w-full px-3 py-2 text-xs font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">View</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
