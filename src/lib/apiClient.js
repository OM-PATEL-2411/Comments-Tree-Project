// Reusable fetch helper for API requests — HttpOnly cookies are automatically included by the browser
export async function fetchWithAuth(url, options = {}) {
  return fetch(url, options);
}
