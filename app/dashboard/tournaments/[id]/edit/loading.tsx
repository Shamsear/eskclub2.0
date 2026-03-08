import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function EditTournamentLoading() {
  return (
    <div>
      {/* Breadcrumb Skeleton */}
      <LoadingSkeleton variant="text" width="450px" height={20} className="mb-6" />

      <div className="mb-6">
        <LoadingSkeleton variant="text" width="200px" height={20} className="mb-4" />
        <LoadingSkeleton variant="text" width="200px" height={36} className="mb-2" />
        <LoadingSkeleton variant="text" width="400px" height={20} />
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <LoadingSkeleton variant="text" width="200px" height={24} />
        </div>
        <div className="p-6 space-y-6">
          {/* Form Fields Skeleton */}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i}>
              <LoadingSkeleton variant="text" width="120px" height={16} className="mb-2" />
              <LoadingSkeleton variant="rectangular" height={44} />
            </div>
          ))}

          {/* Date Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i}>
                <LoadingSkeleton variant="text" width="100px" height={16} className="mb-2" />
                <LoadingSkeleton variant="rectangular" height={44} />
              </div>
            ))}
          </div>

          {/* Point System Section */}
          <div className="border-t pt-6">
            <LoadingSkeleton variant="text" width="250px" height={24} className="mb-4" />
            <LoadingSkeleton variant="text" width="350px" height={16} className="mb-4" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i}>
                  <LoadingSkeleton variant="text" width="140px" height={16} className="mb-2" />
                  <LoadingSkeleton variant="rectangular" height={44} />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <LoadingSkeleton variant="rectangular" width="120px" height={44} />
            <LoadingSkeleton variant="rectangular" width="180px" height={44} />
          </div>
        </div>
      </div>
    </div>
  );
}
