// Reusable empty state — shown when there are no comments
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <svg
        className="w-16 h-16 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <p className="text-gray-400 text-sm font-medium">No comments yet.</p>
      <p className="text-gray-300 text-xs mt-1">Be the first to start the conversation.</p>
    </div>
  );
}
