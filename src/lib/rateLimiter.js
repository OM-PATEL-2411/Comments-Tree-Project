import { errorResponse } from "@/lib/ResponseHelper";

// In-memory store for user rate limiting: userId -> timestamp of last successful request
const userLastSuccessStore = new Map();

// Check if user has made a successful request within windowMs (default 3000ms / 3 seconds)
export function checkRateLimit(userId, windowMs = 3000) {
  const now = Date.now();
  const userIdStr = userId.toString();
  const lastTime = userLastSuccessStore.get(userIdStr);

  if (lastTime && now - lastTime < windowMs) {
    return errorResponse("Too many requests. Please wait 3 seconds.", 429);
  }

  return null;
}

// Record the timestamp of a successful request for a user
export function recordRateLimitSuccess(userId) {
  if (userId) {
    userLastSuccessStore.set(userId.toString(), Date.now());
  }
}
