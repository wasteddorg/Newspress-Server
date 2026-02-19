import { prisma } from "../../lib/prisma";

const createComment = async (data: { text: string; postId: string; userId: string; parentId?: string }) => {
  return await prisma.comment.create({
    data: {
      text: data.text,
      postId: data.postId,
      userId: data.userId,
      parentId: data.parentId || null,
    },
    include: {
      user: {
        select: { name: true, image: true, role: true }
      }
    }
  });
};

const getCommentsByPostId = async (postId: string) => {
  return await prisma.comment.findMany({
    where: {
      postId: postId,
      parentId: null 
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true
        }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true
            }
          },
          replies: true 
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getCommentById = async (id: string) => {
  return await prisma.comment.findUnique({
    where: { id }
  });
};

const getAllComments = async () => {
  return await prisma.comment.findMany({
    include: {
      post: { select: { title: true, slug:true } }, 
      user: { select: { name: true, role: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateComment = async (id: string, text: string) => {
  return await prisma.comment.update({
    where: { id },
    data: { text }
  });
};

const deleteComment = async (id: string) => {
  return await prisma.comment.delete({
    where: { id }
  });
};

export const CommentService = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getAllComments,
  getCommentsByPostId
};