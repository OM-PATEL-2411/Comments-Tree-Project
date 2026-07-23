import { apiHandler } from "@/lib/apiHandler";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/ResponseHelper";

export const POST = apiHandler(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON in request body.", 400);
  }

  const { email, password } = body;

  // Validate required fields
  if (!email || !password) {
    return errorResponse("Email and password are required.", 400);
  }

  if (email.trim() === "" || password.trim() === "") {
    return errorResponse("Email and password cannot be empty.", 400);
  }

  await connectDB();

  // Find user by email
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return errorResponse("Invalid email or password.", 401);
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse("Invalid email or password.", 401);
  }

  // Generate JWT
  const token = generateToken(user);

  const response = successResponse("Login successful.", {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });

  // Set HttpOnly cookie for auth
  response.cookies.set("token", token, {
    path: "/",
    maxAge: 604800, // 7 days
    sameSite: "lax",
    httpOnly: true,
  });

  return response;
});
