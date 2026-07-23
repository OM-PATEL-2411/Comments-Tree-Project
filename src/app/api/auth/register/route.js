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

  const { username, email, password } = body;

  // Validate required fields
  if (!username || !email || !password) {
    return errorResponse("Username, email, and password are required.", 400);
  }

  if (username.trim() === "" || email.trim() === "" || password.trim() === "") {
    return errorResponse("Username, email, and password cannot be empty.", 400);
  }

  if (password.length < 6) {
    return errorResponse("Password must be at least 6 characters.", 400);
  }

  await connectDB();

  // Check for duplicate username
  const existingUsername = await User.findOne({ username: username.trim() });
  if (existingUsername) {
    return errorResponse("Username already exists.", 409);
  }

  // Check for duplicate email
  const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingEmail) {
    return errorResponse("Email already exists.", 409);
  }

  // Create user (password is hashed via pre-save hook)
  const user = await User.create({
    username: username.trim(),
    email: email.trim(),
    password,
  });

  const token = generateToken(user);

  const response = successResponse(
    "User registered successfully.",
    {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    },
    201
  );

  // Set HttpOnly cookie for auth
  response.cookies.set("token", token, {
    path: "/",
    maxAge: 604800, // 7 days
    sameSite: "lax",
    httpOnly: true,
  });

  return response;
});
