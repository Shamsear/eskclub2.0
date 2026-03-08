import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function EditMatchLoading() {
  return (
    <div>
      {/* Breadcrumb Skeleton */}
      <LoadingSkeleton variant="text" width="450px" height={20} className="mb-6" />

      <div className="mb-6">
        <LoadingSkeleton variant="text" width="180px" height={20} className="mb-4" />
        <LoadingSkeleton variant="text" width="220px" height={36} className="mb-2" />
        <LoadingSkeleton variant="text" width="350px" height={20} />
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <LoadingSkeleton variant="text" width="180px" height={24} />
        </div>
        <div className="p-6 space-y-6">
          {/* Match Date Field */}
          <div>
            <LoadingSkeleton variant="text" width="100px" height={16} className="mb-2" />
            <LoadingSkeleton variant="rectangular" height={44} />
          </div>

          {/* Player Results Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <LoadingSkeleton variant="text" width="150px" height={24} className="mb-2" />
                <LoadingSkeleton variant="text" width="300px" height={16} />
              </div>
              <LoadingSkeleton variant="rectangular" width="120px" height={36} />
            </div>

            {/* Player Result Cards Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <LoadingSkeleton variant="text" width="80px" height={16} />
                    <LoadingSkeleton variant="text" width="60px" height={16} />
                  </div>

                  <div className="space-y-4">
                    {/* Player Select */}
                    <div>
                      <LoadingSkeleton variant="text" width="60px" height={16} className="mb-2" />
                      <LoadingSkeleton variant="rectangular" height={44} />
                    </div>

                    {/* Outcome Buttons */}
                    <div>
                      <LoadingSkeleton variant="text" width="80px" height={16} className="mb-2" />
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }, (_, j) => (
                          <LoadingSkeleton key={j} variant="rectangular" height={44} />
                        ))}
                      </div>
                    </div>

                    {/* Goals Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Array.from({ length: 2 }, (_, j) => (
                        <div key={j}>
                          <LoadingSkeleton variant="text" width="100px" height={16} className="mb-2" />
                          <LoadingSkeleton variant="rectangular" height={44} />
                        </div>
                      ))}
                    </div>

                    {/* Points Preview */}
                    <LoadingSkeleton variant="rectangular" height={60} />
                  </div>
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
