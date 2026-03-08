import { requireAuth } from "@/lib/auth-utils";
import Link from "next/link";
import { TournamentForm } from "@/components/TournamentForm";
import { Breadcrumb } from "@/components/Breadcrumb";

export default async function NewTournamentPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tournaments", href: "/dashboard/tournaments" },
          { label: "New Tournament" },
        ]}
      />

      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href="/dashboard/tournaments"
            className="inline-flex items-center gap-2 text-white hover:text-violet-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tournaments
          </Link>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Create Tournament</h1>
              <p className="text-white text-opacity-90 mt-1">
                Set up a new tournament with custom rules and point system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <TournamentForm mode="create" />
      </div>
    </div>
  );
}
