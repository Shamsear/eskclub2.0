'use client';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function LoadingSkeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: LoadingSkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'card':
        return 'rounded-lg h-48';
      default:
        return 'rounded-md';
    }
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`animate-pulse bg-gray-200 ${getVariantClasses()} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  ));

  return count > 1 ? <div className="space-y-3">{skeletons}</div> : skeletons[0];
}

export function MemberCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <LoadingSkeleton variant="circular" width={64} height={64} />
            <div className="flex-1 space-y-3">
              <LoadingSkeleton variant="text" width="60%" height={20} />
              <LoadingSkeleton variant="text" width="40%" height={16} />
              <div className="flex gap-2">
                <LoadingSkeleton variant="rectangular" width={80} height={24} />
                <LoadingSkeleton variant="rectangular" width={80} height={24} />
              </div>
            </div>
            <LoadingSkeleton variant="rectangular" width={100} height={36} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClubCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6">
          <LoadingSkeleton variant="rectangular" width="100%" height={128} className="mb-4" />
          <LoadingSkeleton variant="text" width="80%" height={24} className="mb-2" />
          <LoadingSkeleton variant="text" width="100%" height={16} className="mb-2" />
          <LoadingSkeleton variant="text" width="90%" height={16} className="mb-4" />
          <div className="grid grid-cols-2 gap-2 mb-4">
            <LoadingSkeleton variant="text" height={16} />
            <LoadingSkeleton variant="text" height={16} />
            <LoadingSkeleton variant="text" height={16} />
            <LoadingSkeleton variant="text" height={16} />
          </div>
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <LoadingSkeleton variant="rectangular" className="flex-1" height={36} />
            <LoadingSkeleton variant="rectangular" width={60} height={36} />
            <LoadingSkeleton variant="rectangular" width={70} height={36} />
          </div>
        </div>
      ))}
    </div>
  );
}
