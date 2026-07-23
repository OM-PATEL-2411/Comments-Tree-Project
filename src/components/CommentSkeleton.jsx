// Loading skeleton that mimics comment card layout
export default function CommentSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
        >
          {/* Avatar + name + time skeleton */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-24 bg-gray-200 rounded" />
              <div className="h-2.5 w-16 bg-gray-100 rounded" />
            </div>
          </div>
          {/* Message lines skeleton */}
          <div className="pl-12 space-y-2 mb-4">
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
          </div>
          {/* Action buttons skeleton */}
          <div className="flex gap-2 pl-12">
            <div className="h-7 w-16 bg-gray-100 rounded-lg" />
            <div className="h-7 w-20 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
