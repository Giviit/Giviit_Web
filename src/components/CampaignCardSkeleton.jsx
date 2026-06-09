export default function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
        <div className="h-2 bg-gray-200 rounded-full mb-3" />
        <div className="flex justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
          <div className="text-right">
            <div className="h-3 bg-gray-100 rounded w-16 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
