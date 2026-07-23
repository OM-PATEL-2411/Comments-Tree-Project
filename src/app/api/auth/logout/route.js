import { apiHandler } from "@/lib/apiHandler";
import { successResponse } from "@/lib/ResponseHelper";

export const POST = apiHandler(async () => {
  const response = successResponse("Logout successful.");

  // Clear HttpOnly token cookie
  response.cookies.set("token", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
});
