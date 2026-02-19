import { Request, Response } from "express";
import { CommentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const { text, postId, parentId } = req.body;
    const userId = (req as any).user.id;

    const result = await CommentService.createComment({ text, postId, userId, parentId });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getPostComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const comments = await CommentService.getCommentsByPostId(postId);
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
const getComments = async (req: Request, res: Response) => {
  try {
    const result = await CommentService.getAllComments();
    res.status(200).json({
      success: true,
      message: "Comments fetched successfully!",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch comments"
    });
  }
};
const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = (req as any).user.id;

    const comment = await CommentService.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    const result = await CommentService.updateComment(commentId, text);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const user = (req as any).user;

    const comment = await CommentService.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId === user.id || user.role === "ADMIN") {
      await CommentService.deleteComment(commentId);
      return res.json({ message: "Comment deleted successfully" });
    }

    res.status(403).json({ message: "Unauthorized! Only owner or admin can delete" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const CommentController = {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  getPostComments
};