import mongoose from "mongoose";
import { apiHandler } from "@/lib/apiHandler";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { successResponse, errorResponse } from "@/lib/ResponseHelper";
import { authenticate } from "@/lib/auth";
import { checkRateLimit, recordRateLimitSuccess } from "@/lib/rateLimiter";

export const POST = apiHandler(async (request) => {
  const user = await authenticate(request);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  // Server-side rate limiting: 1 successful comment creation every 3 seconds per user ID
  const rateLimitError = checkRateLimit(user._id, 3000);
  if (rateLimitError) {
    return rateLimitError;
  }

  // Parse the request body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON in request body.", 400);
  }

  const { message, parentId } = body;

  // Validate required message field
  if (!message || message.trim() === "") {
    return errorResponse("Message is required.", 400);
  }

  await connectDB();

  // If parentId is provided, validate it
  if (parentId !== null && parentId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return errorResponse("Invalid parent comment ID.", 400);
    }

    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return errorResponse("Parent comment not found.", 404);
    }
  }

  // Automatically populate author from authenticated user JWT
  const comment = await Comment.create({
    author: {
      id: user._id,
      username: user.username,
    },
    message: message.trim(),
    parentId: parentId || null,
  });

  // Record successful request timestamp for rate limiting
  recordRateLimitSuccess(user._id);

  return successResponse("Comment created successfully.", comment, 201);
});

export const GET = apiHandler(async (request) => {
  const user = await authenticate(request);
  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const cursor = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");

  const limitNum = parseInt(limitParam, 10) || 20;

  // Root comment query filter (parentId: null, isDeleted: { $ne: true })
  let rootFilter = { parentId: null, isDeleted: { $ne: true } };

  if (search && search.trim() !== "") {
    const searchTerm = search.trim();
    rootFilter.$or = [
      { "author.username": { $regex: searchTerm, $options: "i" } },
      { message: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Cursor-based pagination filter for root comments
  if (cursor && cursor.trim() !== "") {
    const cursorDate = new Date(cursor.trim());
    if (!isNaN(cursorDate.getTime())) {
      rootFilter.createdAt = { $gt: cursorDate };
    }
  }

  // Fetch limit + 1 root comments to determine hasMore
  const rootDocs = await Comment.find(rootFilter)
    .sort({ createdAt: 1 })
    .limit(limitNum + 1)
    .lean();

  let hasMore = false;
  let nextCursor = null;
  let pageRoots = rootDocs;

  if (rootDocs.length > limitNum) {
    hasMore = true;
    pageRoots = rootDocs.slice(0, limitNum);
    const lastDoc = pageRoots[pageRoots.length - 1];
    nextCursor = lastDoc.createdAt ? lastDoc.createdAt.toISOString() : null;
  }

  if (pageRoots.length === 0) {
    return successResponse("No comments found.", {
      comments: [],
      nextCursor: null,
      hasMore: false,
    });
  }

  // Fetch all non-deleted comments to construct the nested tree for root comments
  const allComments = await Comment.find({ isDeleted: { $ne: true } })
    .sort({ createdAt: 1 })
    .lean();

  const userIdStr = user._id.toString();
  const commentMap = new Map();

  allComments.forEach((comment) => {
    const isLiked =
      Array.isArray(comment.likedBy) &&
      comment.likedBy.some((likedId) => likedId.toString() === userIdStr);

    const isOwner = comment.author?.id
      ? comment.author.id.toString() === userIdStr
      : false;

    const { likedBy, ...rest } = comment;

    commentMap.set(comment._id.toString(), {
      ...rest,
      likes: comment.likes || 0,
      liked: isLiked,
      isOwner,
      isDeleted: comment.isDeleted || false,
      editedAt: comment.editedAt || null,
      children: [],
    });
  });

  // Link children to parents
  commentMap.forEach((comment) => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId.toString());
      if (parent) {
        parent.children.push(comment);
      }
    }
  });

  // Extract nested tree for the current page's root comments
  const paginatedComments = pageRoots
    .map((rootDoc) => commentMap.get(rootDoc._id.toString()))
    .filter(Boolean);

  return successResponse("Comments fetched successfully.", {
    comments: paginatedComments,
    nextCursor,
    hasMore,
  });
});
