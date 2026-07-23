"use client";

import { useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchComments } from "@/lib/fetchComments";
import { useDebounce } from "@/hooks/useDebounce";
import CommentThread from "@/components/CommentThread";
import CommentForm from "@/components/CommentForm";
import CommentSkeleton from "@/components/CommentSkeleton";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ToastContainer from "@/components/ToastContainer";

export default function CommentsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["comments", debouncedSearch],
    queryFn: ({ pageParam = "" }) =>
      fetchComments({ search: debouncedSearch, cursor: pageParam, limit: 5 }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: "",
  });

  // Track which comment's reply form is open (only one at a time)
  const [activeReplyId, setActiveReplyId] = useState(null);

  // Centralized expand/collapse state — stores IDs of collapsed comments
  const [collapsedIds, setCollapsedIds] = useState(new Set());

  const handleToggleCollapse = useCallback((id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      window.location.href = "/authenticate";
    }
  };

  if (isLoading) return <CommentSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  // Flatten comments array from all pages
  const comments = data
    ? data.pages.flatMap((page) => page?.comments || [])
    : [];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <ToastContainer />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header with Logout */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Nested Comments Tree
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Build unlimited nested discussions with live updates.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </header>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Comments section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
          {comments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentThread
                  key={comment._id}
                  comment={comment}
                  activeReplyId={activeReplyId}
                  onReplyClick={setActiveReplyId}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={handleToggleCollapse}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors duration-200 disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More Comments"}
              </button>
            </div>
          )}
        </section>

        {/* Root comment form */}
        <section className="mt-10">
          <CommentForm />
        </section>

      </div>
    </div>
  );
}
