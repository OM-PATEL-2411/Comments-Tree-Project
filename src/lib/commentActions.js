import { fetchWithAuth } from "./apiClient";

export async function updateComment(id, message) {
  const res = await fetchWithAuth(`/api/comments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update comment");
  }

  const json = await res.json();
  return json.data;
}

export async function deleteComment(id) {
  const res = await fetchWithAuth(`/api/comments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete comment");
  }

  const json = await res.json();
  return json.data;
}
