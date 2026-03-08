import { LoadingSkeleton } from "./ui/LoadingSkeleton";

export function MatchListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          {/* Date and actions skeleton */}
          <div className="flex items-center justify-between mb-3">
            <LoadingSkeleton variant="text" width={96} height={16} />
            <div className="flex gap-2">
              <LoadingSkeleton variant="rectangular" width={64} height={32} />
              <LoadingSkeleton variant="rectangular" width={80} height={32} />
            </div>
          </div>

          {/* Player results skeleton */}
          <div className="space-y-2">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between py-2 border-t border-gray-100"
              >
                <div className="flex items-center">
                  <LoadingSkeleton variant="circular" width={32} height={32} className="mr-3" />
                  <LoadingSkeleton variant="text" width={128} height={16} />
                </div>
                <div className="flex items-center gap-4">
                  <LoadingSkeleton variant="rectangular" width={64} height={24} />
                  <LoadingSkeleton variant="text" width={96} height={16} />
                  <LoadingSkeleton variant="text" width={48} height={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
