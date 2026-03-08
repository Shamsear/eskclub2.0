import { requireAuth } from "@/lib/auth-utils";
import { ClubsList } from "@/components/ClubsList";
import Link from "next/link";

export default async function ClubsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FF6600] rounded-lg p-6 sm:p-8 text-white border-t-2 border-[#FFB700]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#CC2900] rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Sports Clubs
              </h1>
            </div>
            <p className="text-white text-sm sm:text-base">
              Manage your clubs, members, and organizational structure
            </p>
          </div>
          <Link href="/dashboard/clubs/new" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#FF6600] rounded-lg hover:bg-[#E4E5E7] transition-colors font-medium flex items-center justify-center gap-2 border border-[#FFB700]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Club
            </button>
          </Link>
        </div>
      </div>

      <ClubsList />

      {/* Mobile FAB */}
      <Link href="/dashboard/clubs/new" className="lg:hidden">
        <button 
          className="fixed bottom-20 right-6 z-40 px-5 py-3 bg-[#FF6600] text-white rounded-full border-t-2 border-[#FFB700] transition-colors flex items-center gap-2 font-medium text-sm active:bg-[#CC2900]"
          aria-label="Create new club"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Club</span>
        </button>
      </Link>
    </div>
  );
}
