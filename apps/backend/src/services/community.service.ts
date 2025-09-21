import mongoose from "mongoose";
import { Comment, Post, Reaction, Tag } from "@models/community.model";
import { User } from "@models/users.models";
import { POST_STATUS, TARGET_TYPES } from "constants/index";
import type {
  CreatePostDTO,
  UpdatePostDTO,
  PostResponseDTO,
  ReactionDTO,
  ReactionResponseDTO,
  CommentResponseDTO,
  TagResponseDTO,
  UserWallResponseDTO,
} from "types/community.dtos";
import slugify from "slugify";
import { getIO } from "config/socket";

// Upsert and increment tags for provided tag names; returns array of slugs
const handleTags = async (tags: string[]) => {
  const slugs: string[] = [];
  for (const tagName of tags) {
    const slug = slugify(tagName, { lower: true, strict: true });
    slugs.push(slug);

    const existing = await Tag.findOne({ slug });
    if (existing) {
      await Tag.updateOne({ _id: existing._id }, { $inc: { postsCount: 1 } });
    } else {
      await Tag.create({ name: slug, slug, postsCount: 1 });
    }
  }
  return slugs;
};

// Adjust tag counts when tags change between versions
const adjustTagCounts = async (oldSlugs: string[], newTagNames: string[]) => {
  const newSlugs = newTagNames.map((t) => slugify(t, { lower: true, strict: true }));
  const oldSet = new Set(oldSlugs || []);
  const newSet = new Set(newSlugs);

  const toAdd: string[] = [];
  const toRemove: string[] = [];

  for (const s of newSet) if (!oldSet.has(s)) toAdd.push(s);
  for (const s of oldSet) if (!newSet.has(s)) toRemove.push(s);

  // Increment for added
  for (const slug of toAdd) {
    const existing = await Tag.findOne({ slug });
    if (existing) {
      await Tag.updateOne({ _id: existing._id }, { $inc: { postsCount: 1 } });
    } else {
      await Tag.create({ name: slug.replace(/-/g, " "), slug, postsCount: 1 });
    }
  }

  // Decrement for removed
  for (const slug of toRemove) {
    await Tag.updateOne({ slug }, { $inc: { postsCount: -1 } });
  }

  return newSlugs;
};

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

const mapPostToDTO = async (postDoc: any): Promise<PostResponseDTO> => {
  const author = await User.findById(postDoc.authorId).select("fullName role");

  return {
    _id: String(postDoc._id),
    authorId: String(postDoc.authorId),
    authorName: author?.fullName ?? "",
    authorRole: author?.role ?? "USER",
    content: postDoc.content ?? undefined,
    media: Array.isArray(postDoc.media) ? postDoc.media : [],   // ✅ đổi từ images → media
    likesCount: postDoc.likesCount ?? 0,
    commentsCount: postDoc.commentsCount ?? 0,
    tags: Array.isArray(postDoc.tags) ? postDoc.tags : undefined,
    status: postDoc.status,
    createdAt: postDoc.createdAt ?? new Date(),
    updatedAt: postDoc.updatedAt ?? postDoc.createdAt ?? new Date(),
  };
};
  const mapReactionDTO = async (doc: any): Promise<ReactionResponseDTO> => {
    return {
      _id: String(doc._id),
      userId: String(doc.userId),
      targetType: doc.targetType,
      postId: doc.postId ? String(doc.postId) : undefined,
      commentId: doc.commentId ? String(doc.commentId) : undefined,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? doc.createdAt ?? new Date(),
    };
  }
const mapCommentToDTO = async (commentDoc: any): Promise<CommentResponseDTO> => {
  const author = await User.findById(commentDoc.authorId).select("fullName role");
  // Note: In a real app, consider caching author info to reduce DB calls
  return {
    _id: String(commentDoc._id),
    authorId: String(commentDoc.authorId),
    authorName: author?.fullName ?? "",
    authorRole: author?.role ?? "USER",
    content: commentDoc.content,
    likesCount: typeof commentDoc.likesCount === "number" ? commentDoc.likesCount : 0,
    createdAt: commentDoc.createdAt ?? new Date(),
    updatedAt: commentDoc.updatedAt ?? commentDoc.createdAt ?? new Date(),
 };
};
const mapTagToDTO = (tagDoc: any): TagResponseDTO => {
  return {
    _id: String(tagDoc._id),
    name: tagDoc.name,
    slug: tagDoc.slug,
    postsCount: tagDoc.postsCount,
  };
}
// Emit socket event only if Socket.IO is initialized
const safeEmit = (event: string, payload: any) => {
  try {
    const io = getIO();
    io.emit(event, payload);
  } catch {
    // Socket not initialized yet; ignore
  }
};

export class CommunityService {
  // Create a new post
async createRealtimePost(authorId: string, dto: CreatePostDTO): Promise<PostResponseDTO> {
  const tagsInput = dto.tags?.filter(Boolean) ?? [];
  const slugs = tagsInput.length ? await handleTags(tagsInput) : [];

  const post = await Post.create({
    authorId: toObjectId(authorId),
    content: dto.content,
    media: dto.media ?? [],  // ✅ thay vì images
    tags: slugs,
    status: dto.status ?? POST_STATUS.PUBLISHED,
  });

  const postDTO = await mapPostToDTO(post);
  safeEmit("newPost", postDTO);
  return postDTO;
}


  // List comments for a post (sorted by likes desc then createdAt desc)
  async listCommentsByPost(postId: string, query: { page?: number; limit?: number }): Promise<{ items: CommentResponseDTO[]; total: number; page: number; pages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { postId: toObjectId(postId), parentId: null };
    const [docs, total] = await Promise.all([
      Comment.find(filter).sort({ likesCount: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Comment.countDocuments(filter),
    ]);

    const items = await Promise.all(docs.map((d) => mapCommentToDTO(d)));
    const pages = Math.ceil(total / limit) || 1;
    return { items, total, page, pages };
  }

  // List posts with optional filters and pagination
  async listPosts(query: {
    page?: number;
    limit?: number;
    authorId?: string;
    tag?: string;
    status?: string;
    q?: string;
  }): Promise<{ items: PostResponseDTO[]; total: number; page: number; pages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.authorId) filter.authorId = toObjectId(query.authorId);
    if (query.tag) filter.tags = query.tag;
    if (query.status) filter.status = query.status;
    if (query.q) {
      const regex = new RegExp(query.q, "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const [docs, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    const items = await Promise.all(docs.map((d) => mapPostToDTO(d)));
    const pages = Math.ceil(total / limit) || 1;
    return { items, total, page, pages };
  }

  // Get post by id
  async getPostById(postId: string): Promise<PostResponseDTO> {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");
    return mapPostToDTO(post);
  }

  // Update post (author only). If tags change, adjust Tag.postsCount
async updateRealtimePost(postId: string, authorId: string, dto: UpdatePostDTO): Promise<PostResponseDTO> {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");
  if (!(post.authorId as mongoose.Types.ObjectId).equals(authorId)) throw new Error("Forbidden");

  if (dto.tags) {
    const oldSlugs = Array.isArray(post.tags) ? (post.tags as string[]) : [];
    post.tags = await adjustTagCounts(oldSlugs, dto.tags);
  }

  if (dto.content !== undefined) post.content = dto.content;
  if (dto.media !== undefined) post.set('media', dto.media);   // ✅ update media thay vì images
  if (dto.status !== undefined) post.status = dto.status;

  await post.save();
  const postDTO = await mapPostToDTO(post);
  safeEmit("postUpdated", postDTO);
  return postDTO;
}

  // Delete post (author only). Decrement tag counts and remove reactions
  async deleteRealtimePost(postId: string, authorId: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (!(post.authorId as mongoose.Types.ObjectId).equals(authorId)) {
      throw new Error("Forbidden");
    }

    const slugs = Array.isArray(post.tags) ? (post.tags as string[]) : [];
    for (const slug of slugs) {
      await Tag.updateOne({ slug }, { $inc: { postsCount: -1 } });
    }

    await Reaction.deleteMany({ postId: post._id });
    // Note: comments cleanup can be added if required
    await Post.deleteOne({ _id: post._id });
    safeEmit("postDeleted", { postId: post._id.toString() });
  }

  // Like a post or comment
  async like(data: ReactionDTO): Promise<ReactionResponseDTO> {
    if (!Object.values(TARGET_TYPES).includes(data.targetType)) {
      throw new Error("Invalid target type");
    }

    const payload: any = {
      userId: toObjectId(data.userId),
      targetType: data.targetType,
      postId: data.postId ? toObjectId(data.postId) : undefined,
      commentId: data.commentId ? toObjectId(data.commentId) : undefined,
    };

    if (data.targetType === TARGET_TYPES.POST) {
      if (!data.postId) {
        throw new Error("postId is required for POST reaction");
      }
      const exists = await Reaction.findOne({
        userId: payload.userId,
        targetType: data.targetType,
        postId: payload.postId,
        commentId: null,
      });
      if (exists) return await mapReactionDTO(exists);

      const reaction = await Reaction.create({
        userId: payload.userId,
        targetType: data.targetType,
        postId: payload.postId,
        commentId: null,
      });

      await Post.updateOne({ _id: payload.postId }, { $inc: { likesCount: 1 } });
  const reactionDTO =await mapReactionDTO(reaction);
  safeEmit("postLiked", { postId: reactionDTO.postId, userId: data.userId });
      return reactionDTO;
    } else {
      if (!data.commentId) {
        throw new Error("commentId is required for COMMENT reaction");
      }

      const exists = await Reaction.findOne({
        userId: payload.userId,
        targetType: data.targetType,
        commentId: payload.commentId,
        postId: null,
      });
      if (exists) return await mapReactionDTO(exists);

      const reaction = await Reaction.create({
        userId: payload.userId,
        targetType: data.targetType,
        postId: null,
        commentId: payload.commentId,
      });

      await Comment.updateOne(
        { _id: payload.commentId },
        { $inc: { likesCount: 1 } }
      );
  const reactionDTO = await mapReactionDTO(reaction);
  safeEmit("commentLiked", { commentId: reactionDTO.commentId, userId: data.userId });
      return reactionDTO;
    }
  }

  // Unlike a post or comment
  async unlike(data: ReactionDTO): Promise<void> {
    if (!Object.values(TARGET_TYPES).includes(data.targetType)) {
      throw new Error("Invalid target type");
    }

    const query: any = {
      userId: toObjectId(data.userId),
      targetType: data.targetType,
    };

    if (data.targetType === TARGET_TYPES.POST) {
      if (!data.postId) {
        throw new Error("postId is required for POST reaction");
      }
      query.postId = toObjectId(data.postId);
      query.commentId = null;
      const deleted = await Reaction.findOneAndDelete(query);
      if (deleted) {
        await Post.updateOne({ _id: query.postId }, { $inc: { likesCount: -1 } });
        safeEmit("postUnliked", { postId: query.postId, userId: data.userId });
      }
    } else {
      if (!data.commentId) {
        throw new Error("commentId is required for COMMENT reaction");
      }
      query.commentId = toObjectId(data.commentId);
      query.postId = null;
      const deleted = await Reaction.findOneAndDelete(query);
      if (deleted) {
        await Comment.updateOne(
          { _id: query.commentId },
          { $inc: { likesCount: -1 } }
        );
        safeEmit("commentUnliked", { commentId: query.commentId, userId: data.userId });
      }
    }
  }

  // List postIds the user has liked (optionally filtered by provided postIds)
  async listMyLikedPostIds(userId: string, postIds?: string[]): Promise<string[]> {
    const filter: any = {
      userId: toObjectId(userId),
      targetType: TARGET_TYPES.POST,
    };
    if (postIds && postIds.length) {
      filter.postId = { $in: postIds.map((id) => toObjectId(id)) };
    } else {
      filter.postId = { $ne: null };
    }
    const docs = await Reaction.find(filter).select('postId').lean();
    return docs.map((d: any) => String(d.postId));
  }
  async listMyLikedCommentIds(userId: string, opts?: { commentIds?: string[]; postId?: string }): Promise<string[]> {
    const filter: any = {
      userId: toObjectId(userId),
      targetType: TARGET_TYPES.COMMENT,
    };
    if (opts?.commentIds?.length) {
      filter.commentId = { $in: opts.commentIds.map((id) => toObjectId(id)) };
    } else if (opts?.postId) {
      const comments = await Comment.find({ postId: toObjectId(opts.postId) }).select('_id').lean();
      const cids = comments.map((c: any) => c._id);
      if (!cids.length) return [];
      filter.commentId = { $in: cids };
    } else {
      filter.commentId = { $ne: null };
    }
    const docs = await Reaction.find(filter).select('commentId').lean();
    return docs.map((d: any) => String(d.commentId));
  }
  async getPostsByTag(tag: string, query: { page?: number; limit?: number }): Promise<{ items: PostResponseDTO[]; total: number; page: number; pages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;
    const filter: any = { tags: tag };
    const [docs, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);
    const items = await Promise.all(docs.map((d: any) => mapPostToDTO(d)));
    return { items, total, page, pages: Math.ceil(total / limit) };
  }
  async getTrendingTags(limit: number = 10): Promise<TagResponseDTO[]> {
    const docs = await Tag.find().sort({ postsCount: -1 }).limit(limit).lean();
    return docs.map((d: any) =>  mapTagToDTO(d));
  }
  async getAllTags(): Promise<TagResponseDTO[]> {
    const docs = await Tag.find().sort({ name: 1 }).lean();
    return docs.map((d: any) => mapTagToDTO(d));
  }
  


  //user wall
  async getUserWall(userId:string):Promise<UserWallResponseDTO>{
    const user = await User.findById(userId).lean();
    const postsCount = await Post.countDocuments({userId:userId});
    const followersCount = 0;
    const followingCount = 0;
    return {
     _id: user?._id || "",
      fullName: user?.fullName || "",
      avatarUrl: user?.avatarUrl || "",
      role: user?.role || "",
      postsCount,
      followersCount,
      followingCount
    }
  }

}

