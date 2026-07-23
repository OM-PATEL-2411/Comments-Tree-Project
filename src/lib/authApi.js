// API functions for authentication

export async function registerUser({ username, email, password }) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Registration failed");
  }

  return json;
}

export async function loginUser({ email, password }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Login failed");
  }

  return json;
}
