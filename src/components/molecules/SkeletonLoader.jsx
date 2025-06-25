const SkeletonLoader = ({ count = 1, type = 'card', className = '' }) => {
  const skeletonTypes = {
    card: (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-200 rounded w-3/4"></div>
              <div className="h-3 bg-surface-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-surface-200 rounded"></div>
            <div className="h-3 bg-surface-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    ),
    list: (
      <div className="bg-white rounded-lg border border-surface-200">
        <div className="animate-pulse p-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-surface-200 rounded"></div>
            <div className="flex-1 h-4 bg-surface-200 rounded"></div>
            <div className="w-16 h-6 bg-surface-200 rounded-full"></div>
          </div>
        </div>
      </div>
    ),
    table: (
      <div className="bg-white rounded-lg border border-surface-200">
        <div className="animate-pulse p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-surface-200 rounded"></div>
            <div className="h-4 bg-surface-200 rounded"></div>
            <div className="h-4 bg-surface-200 rounded"></div>
            <div className="h-4 bg-surface-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    ),
    stat: (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 bg-surface-200 rounded-lg"></div>
            <div className="w-16 h-6 bg-surface-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-surface-200 rounded w-2/3"></div>
          <div className="h-4 bg-surface-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {skeletonTypes[type]}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;