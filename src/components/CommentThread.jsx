import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";

// Recursively renders a comment and its nested children with reply, collapse, like, edit, and soft delete support
export default function CommentThread({ comment, depth = 0, activeReplyId, onReplyClick, collapsedIds, onToggleCollapse }) {
  // Do not render any soft-deleted comments
  if (comment.isDeleted) {
    return null;
  }

  const timestamp = formatRelativeTime(comment.createdAt);
  const isReplying = activeReplyId === comment._id;
  const visibleChildren = comment.children?.filter((child) => !child.isDeleted) || [];
  const hasChildren = visibleChildren.length > 0;
  const isExpanded = !collapsedIds.has(comment._id);

  return (
    <div className={depth > 0 ? "ml-6 sm:ml-10 border-l-2 border-blue-200 pl-4 sm:pl-6" : ""}>
      <CommentCard
        commentId={comment._id}
        author={typeof comment.author === "string" ? comment.author : comment.author?.username || "Unknown"}
        message={comment.message}
        timestamp={timestamp}
        createdAt={comment.createdAt}
        likes={comment.likes || 0}
        liked={comment.liked || false}
        isOwner={comment.isOwner || false}
        isDeleted={false}
        editedAt={comment.editedAt || null}
        depth={depth}
        onReply={() => onReplyClick(isReplying ? null : comment._id)}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onToggleExpand={() => onToggleCollapse(comment._id)}
      />

      {/* Inline reply form */}
      {isReplying && (
        <div className="mt-3 ml-6 sm:ml-10">
          <CommentForm
            parentId={comment._id}
            onCancel={() => onReplyClick(null)}
            onSuccess={() => onReplyClick(null)}
          />
        </div>
      )}

      {/* Recursively render non-deleted children only when expanded */}
      {hasChildren && isExpanded && (
        <div className="mt-4 space-y-4">
          {visibleChildren.map((child) => (
            <CommentThread
              key={child._id}
              comment={child}
              depth={depth + 1}
              activeReplyId={activeReplyId}
              onReplyClick={onReplyClick}
              collapsedIds={collapsedIds}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}
