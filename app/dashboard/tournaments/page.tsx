import { requireAuth } from "@/lib/auth-utils";
import { getAllTournaments } from "@/lib/data/tournaments";
import { TournamentsList } from "@/components/TournamentsList";
import Link from "next/link";
import { logError } from "@/lib/errors";

export default async function TournamentsPage() {
  await requireAuth();
  
  try {
    const tournaments = await getAllTournaments();

    return (
      <div className="space-y-6">
        {/* Header with Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Tournaments
                  </h1>
                </div>
                <p className="text-white text-opacity-90 text-sm sm:text-base">
                  Organize competitions and track match results
                </p>
              </div>
              <Link href="/dashboard/tournaments/new" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 py-2.5 bg-white text-violet-600 rounded-xl hover:bg-violet-50 transition-all shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Tournament
                </button>
              </Link>
            </div>
          </div>
        </div>

        <TournamentsList initialTournaments={tournaments} />

        {/* Mobile FAB */}
        <Link href="/dashboard/tournaments/new" className="lg:hidden">
          <button 
            className="fixed bottom-20 right-6 z-40 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 font-medium text-sm hover:scale-105 active:scale-95"
            aria-label="Create new tournament"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Tournament</span>
          </button>
        </Link>
      </div>
    );
  } catch (error) {
    logError(error, { page: 'tournaments-list' });
    
    // Return error UI instead of throwing
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tournaments</h1>
            <p className="text-gray-600 mt-1">Organize and manage your tournaments</p>
          </div>
          <Link href="/dashboard/tournaments/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Tournament
            </button>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 sm:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Tournaments
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t load the tournaments. This might be due to a network issue or server problem.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
              >
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
