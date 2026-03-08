import { requireAuth } from "@/lib/auth-utils";
import { PointSystemWizard } from "@/components/PointSystemWizard";
import Link from "next/link";

export default async function NewPointSystemPage() {
  await requireAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link
            href="/dashboard/point-systems"
            className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Point Systems
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Create Point System</h1>
              <p className="text-white text-opacity-90 mt-1">
                Configure tournament structure and stage-based points
              </p>
            </div>
          </div>
        </div>
      </div>

      <PointSystemWizard />
    </div>
  );
}
