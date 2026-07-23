import mongoose from "mongoose";
import { apiHandler } from "@/lib/apiHandler";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { successResponse, errorResponse } from "@/lib/ResponseHelper";
import { authenticate } from "@/lib/auth";

// PATCH /api/comments/:id — Update comment message (Author only, within 5 minutes)
export const PATCH = apiHandler(async (request, context) => {
  const user = await authenticate(request);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  const params = await context.params;
  const { id } = params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return errorResponse("Invalid comment ID.", 400);
  }

  await connectDB();

  const comment = await Comment.findById(id);
  if (!comment) {
    return errorResponse("Comment not found.", 404);
  }

  // Ownership Authorization — only original author can edit
  const authorIdStr = comment.author?.id ? comment.author.id.toString() : null;
  const userIdStr = user._id ? user._id.toString() : null;

  if (!authorIdStr || !userIdStr || authorIdStr !== userIdStr) {
    return errorResponse("Forbidden", 403);
  }

  // Enforce 5-minute edit restriction
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const createdAtTime = new Date(comment.createdAt).getTime();
  const elapsedMs = Date.now() - createdAtTime;

  if (elapsedMs > FIVE_MINUTES_MS) {
    return errorResponse(
      "Comments can only be edited within 5 minutes of posting.",
      403
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON in request body.", 400);
  }

  const { message } = body;
  if (!message || typeof message !== "string" || message.trim() === "") {
    return errorResponse("Message is required.", 400);
  }

  comment.message = message.trim();
  comment.editedAt = new Date();
  await comment.save();

  return successResponse("Comment updated successfully.", comment);
});

// DELETE /api/comments/:id — Soft delete comment (Author only)
export const DELETE = apiHandler(async (request, context) => {
  const user = await authenticate(request);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  const params = await context.params;
  const { id } = params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return errorResponse("Invalid comment ID.", 400);
  }

  await connectDB();

  const comment = await Comment.findById(id);
  if (!comment) {
    return errorResponse("Comment not found.", 404);
  }

  // Ownership Authorization — only original author can delete
  const authorIdStr = comment.author?.id ? comment.author.id.toString() : null;
  const userIdStr = user._id ? user._id.toString() : null;

  if (!authorIdStr || !userIdStr || authorIdStr !== userIdStr) {
    return errorResponse("Forbidden", 403);
  }

  // Soft Delete — update flag in MongoDB
  comment.isDeleted = true;
  await comment.save();

  return successResponse("Comment deleted successfully.", comment);
});
