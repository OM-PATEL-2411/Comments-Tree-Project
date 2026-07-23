import { fetchWithAuth } from "./apiClient";

// Reusable API function for fetching comments with cursor pagination and optional search
export async function fetchComments({ search = "", cursor = "", limit = 5 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", limit.toString());

  const url = `/api/comments?${params.toString()}`;

  const res = await fetchWithAuth(url);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch comments");
  }

  const json = await res.json();
  return json.data;
}
