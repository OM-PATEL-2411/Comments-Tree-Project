import { errorResponse } from "@/lib/ResponseHelper";

// Global error handler wrapper for Next.js App Router API route handlers
export function apiHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("Global API Error:", error);
      const status = error.status || error.statusCode || 500;
      const message = error.message || "Internal Server Error";
      return errorResponse(message, status);
    }
  };
}
