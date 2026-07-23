"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLikeComment } from "@/lib/likeComment";
import { updateComment, deleteComment } from "@/lib/commentActions";
import { showToast } from "@/components/ToastContainer";

// Single comment card supporting avatar, author, timestamp, message, like, reply, edit (5-min limit), and soft delete
export default function CommentCard({
  commentId,
  author,
  message,
  timestamp,
  createdAt,
  likes = 0,
  liked = false,
  isOwner = false,
  isDeleted = false,
  editedAt = null,
  onReply,
  isExpanded,
  hasChildren,
  onToggleExpand,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(message || "");
  const [editError, setEditError] = useState("");

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateComment(commentId, editMessage),
    onSuccess: () => {
      setIsEditing(false);
      setEditError("");
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (err) => {
      const errMsg = err.message || "Failed to update comment";
      setEditError(errMsg);
      showToast(errMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const handleLike = () => {
    if (commentId && !isDeleted) {
      likeMutation.mutate();
    }
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setEditError("");
    if (!editMessage.trim()) {
      setEditError("Message is required.");
      return;
    }
    updateMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteMutation.mutate();
    }
  };

  // 5-minute edit window check
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const createdAtMs = createdAt ? new Date(createdAt).getTime() : 0;
  const isWithinFiveMinutes = Date.now() - createdAtMs <= FIVE_MINUTES_MS;
  const canEdit = isOwner && !isDeleted && isWithinFiveMinutes;

  const initial = (author || "U").charAt(0).toUpperCase();

  // Deterministic avatar color based on author name
  const colors = [
    "bg-blue-600",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-sky-500",
    "bg-teal-500",
  ];
  const avatarColor = colors[(author || "U").charCodeAt(0) % colors.length];

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Header: avatar + name + timestamp */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`${avatarColor} w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0`}
          >
            {initial}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-sm font-semibold text-gray-900">{author}</span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{timestamp}</span>
              {editedAt && !isDeleted && (
                <span className="text-gray-400 font-normal">(edited)</span>
              )}
            </div>
          </div>
        </div>

        {/* Message body / Edit Form / Deleted Placeholder */}
        {isDeleted ? (
          <p className="text-sm text-gray-400 italic mb-4 pl-12">
            This comment has been deleted.
          </p>
        ) : isEditing ? (
          <form onSubmit={handleEditSave} className="mb-4 pl-12">
            <textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
            {editError && (
              <p className="text-xs text-red-500 mt-1">{editError}</p>
            )}
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditMessage(message);
                  setEditError("");
                }}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors duration-200"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed mb-4 pl-12">
            {message}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pl-12 flex-wrap">
          {!isDeleted && (
            <>
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors duration-200 ${
                  liked
                    ? "text-pink-600 bg-pink-50 hover:bg-pink-100 font-semibold"
                    : "text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {liked ? (
                  <svg className="w-3.5 h-3.5 fill-pink-600 text-pink-600 shrink-0" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
              </button>

              {/* Reply Button */}
              <button
                onClick={onReply}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v3M3 10l4-4m-4 4l4 4" />
                </svg>
                Reply
              </button>

              {/* Edit Button (Author only, within 5 minutes) */}
              {canEdit && !isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditMessage(message);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition-colors duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}

              {/* Delete Button (Author only) */}
              {isOwner && !isEditing && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </>
          )}

          {/* Collapse/Expand Button */}
          {hasChildren && (
            <button
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition-colors duration-200"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
