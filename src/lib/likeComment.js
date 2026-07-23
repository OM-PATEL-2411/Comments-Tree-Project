import { fetchWithAuth } from "./apiClient";

export async function toggleLikeComment(commentId) {
  const res = await fetchWithAuth(`/api/comments/${commentId}/like`, {
    method: "POST",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to toggle like");
  }

  const json = await res.json();
  return json.data;
}
