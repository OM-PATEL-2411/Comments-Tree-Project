import { fetchWithAuth } from "./apiClient";

export async function createComment({ message, parentId }) {
  const body = { message: message.trim() };

  if (parentId) {
    body.parentId = parentId;
  }

  const res = await fetchWithAuth("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to post comment");
  }

  const json = await res.json();
  return json.data;
}
