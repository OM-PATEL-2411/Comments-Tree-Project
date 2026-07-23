import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function authenticate(request) {
  try {
    // Read JWT from HttpOnly cookie
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    // Verify JWT
    const decoded = verifyToken(token);

    await connectDB();

    const user = await User.findById(decoded.id)
      .select("-password")
      .lean();

    return user || null;
  } catch (error) {
    console.error("Authentication failed:", error);
    return null;
  }
}