import mongoose from "mongoose";
import { apiHandler } from "@/lib/apiHandler";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { successResponse, errorResponse } from "@/lib/ResponseHelper";
import { authenticate } from "@/lib/auth";

export const POST = apiHandler(async (request, context) => {
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

  const userIdStr = user._id.toString();
  const likedIndex = comment.likedBy.findIndex(
    (likedUserId) => likedUserId.toString() === userIdStr
  );

  let isLiked = false;
  let message = "";

  if (likedIndex > -1) {
    // User has already liked the comment -> Unlike it
    comment.likedBy.splice(likedIndex, 1);
    comment.likes = Math.max(0, (comment.likes || 0) - 1);
    isLiked = false;
    message = "Comment unliked successfully.";
  } else {
    // User has not liked the comment -> Like it
    comment.likedBy.push(user._id);
    comment.likes = (comment.likes || 0) + 1;
    isLiked = true;
    message = "Comment liked successfully.";
  }

  await comment.save();

  return successResponse(message, {
    likes: comment.likes,
    liked: isLiked,
  });
});
