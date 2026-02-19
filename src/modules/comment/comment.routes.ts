import express from "express";
import { CommentController } from "./comment.controller.js";
import auth, { UserRole } from "../../middleware/auth.js";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.USER, UserRole.ADMIN),
    CommentController.createComment
);

router.get("/", CommentController.getComments);

router.get("/post/:postId", CommentController.getPostComments);

router.patch(
    "/:commentId",
    auth(UserRole.USER, UserRole.ADMIN),
    CommentController.updateComment
);

router.delete(
    "/:commentId",
    auth(UserRole.USER, UserRole.ADMIN),
    CommentController.deleteComment
);

export const CommentRoutes: any = router;