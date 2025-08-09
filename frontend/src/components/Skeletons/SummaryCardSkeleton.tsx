

const SummaryCardSkeleton = () => {
  return (
    <div className="bg-gray-200 rounded-xl shadow-lg p-6 animate-pulse mb-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-5 bg-gray-300 rounded mb-3 w-3/4"></div>
          {/* Value skeleton */}
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
        {/* Icon skeleton */}
        <div className="w-8 h-8 bg-gray-300 rounded ml-4"></div>
      </div>
    </div>
  );
};

export default SummaryCardSkeleton;