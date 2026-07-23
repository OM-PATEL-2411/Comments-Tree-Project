import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "❌ JWT_SECRET is not defined. " +
      "Please add it to your .env.local file:\n" +
      "JWT_SECRET=your_secret_key_here"
  );
}

// Generate a signed JWT for the given user payload
export function generateToken(user) {
  return jwt.sign(
    { id: user._id || user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify and decode a JWT — returns the decoded payload or throws
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
