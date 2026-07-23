"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@/lib/createComment";
import { showToast } from "@/components/ToastContainer";

// Helpers for optimistic cache updates across pages in useInfiniteQuery
function addCommentToPages(data, newComment) {
  if (!data || !data.pages) return data;

  const isReply = !!newComment.parentId;

  function addReplyToTree(comments, reply) {
    return comments.map((comment) => {
      if (comment._id.toString() === reply.parentId.toString()) {
        return {
          ...comment,
          children: [...(comment.children || []), reply],
        };
      }
      if (comment.children?.length > 0) {
        return {
          ...comment,
          children: addReplyToTree(comment.children, reply),
        };
      }
      return comment;
    });
  }

  const updatedPages = data.pages.map((page, index) => {
    if (!page || !page.comments) return page;

    if (!isReply) {
      if (index === 0) {
        return {
          ...page,
          comments: [newComment, ...page.comments],
        };
      }
      return page;
    } else {
      return {
        ...page,
        comments: addReplyToTree(page.comments, newComment),
      };
    }
  });

  return { ...data, pages: updatedPages };
}

function replaceCommentInPages(data, tempId, realComment) {
  if (!data || !data.pages) return data;

  function replaceInTree(comments) {
    return comments.map((comment) => {
      if (comment._id === tempId) {
        return {
          ...realComment,
          isOwner: true,
          liked: false,
          likes: realComment.likes || 0,
          children: comment.children || [],
        };
      }
      if (comment.children?.length > 0) {
        return {
          ...comment,
          children: replaceInTree(comment.children),
        };
      }
      return comment;
    });
  }

  const updatedPages = data.pages.map((page) => {
    if (!page || !page.comments) return page;
    return {
      ...page,
      comments: replaceInTree(page.comments),
    };
  });

  return { ...data, pages: updatedPages };
}

// Reusable form for both root comments and replies with Optimistic UI & Rollback support
export default function CommentForm({ parentId = null, onCancel = null, onSuccess = null }) {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createComment,
    onMutate: async (newCommentVariables) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["comments"] });

      // Snapshot previous query data
      const previousData = queryClient.getQueryData(["comments", ""]);

      const tempId = `temp-${Date.now()}`;
      const optimisticComment = {
        _id: tempId,
        author: {
          id: "temp-author-id",
          username: "You",
        },
        message: newCommentVariables.message.trim(),
        createdAt: new Date().toISOString(),
        parentId: newCommentVariables.parentId || null,
        likes: 0,
        liked: false,
        isOwner: true,
        isDeleted: false,
        children: [],
      };

      // Optimistically insert comment into cache
      queryClient.setQueriesData({ queryKey: ["comments"] }, (oldData) =>
        addCommentToPages(oldData, optimisticComment)
      );

      // Reset form and notify parent immediately
      setMessage("");
      setErrors({});
      onSuccess?.();

      return { previousData, tempId };
    },
    onError: (err, newCommentVariables, context) => {
      // Rollback to previous state on failure
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: ["comments"] }, context.previousData);
      }

      const isReply = !!newCommentVariables.parentId;
      const errorMsg =
        err.message || (isReply ? "Failed to post reply." : "Failed to post comment.");

      showToast(errorMsg);
    },
    onSuccess: (realComment, newCommentVariables, context) => {
      // Replace temporary comment with actual server comment
      if (context?.tempId && realComment) {
        queryClient.setQueriesData({ queryKey: ["comments"] }, (oldData) =>
          replaceCommentInPages(oldData, context.tempId, realComment)
        );
      }
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!message.trim()) newErrors.message = "Message is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ message, parentId });
  };

  const isReply = !!parentId;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
      {!isReply && (
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Leave a comment
        </h3>
      )}

      {/* Message field */}
      <div className="mb-3">
        <textarea
          placeholder={isReply ? "Write a reply..." : "Write a comment..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={isReply ? 3 : 4}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        {errors.message && (
          <p className="text-xs text-red-500 mt-1">{errors.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className={`inline-flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 ${
            mutation.isPending
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {!mutation.isPending && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          {mutation.isPending ? "Posting..." : isReply ? "Post Reply" : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
