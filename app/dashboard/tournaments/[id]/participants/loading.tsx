import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function ParticipantsLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Skeleton */}
      <LoadingSkeleton variant="text" width="400px" height={20} />

      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <LoadingSkeleton variant="text" width="300px" height={32} className="mb-2" />
            <LoadingSkeleton variant="text" width="250px" height={20} />
          </div>
          <LoadingSkeleton variant="rectangular" width="180px" height={44} />
        </div>
      </div>

      {/* Participants List Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* List Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <LoadingSkeleton variant="text" width="200px" height={24} className="mb-1" />
              <LoadingSkeleton variant="text" width="300px" height={16} />
            </div>
            <LoadingSkeleton variant="rectangular" width="180px" height={44} />
          </div>
        </div>

        {/* Participants Grid Skeleton */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center flex-1">
                    <LoadingSkeleton variant="circular" width={48} height={48} className="mr-3" />
                    <div className="flex-1 space-y-2">
                      <LoadingSkeleton variant="text" width="80%" height={20} />
                      <LoadingSkeleton variant="text" width="90%" height={16} />
                      <LoadingSkeleton variant="text" width="60%" height={14} />
                    </div>
                  </div>
                  <LoadingSkeleton variant="rectangular" width={40} height={40} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
