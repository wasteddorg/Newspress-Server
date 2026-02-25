// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express5 from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true
    },
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true
        }
      },
      sessionData: {
        attributes: {
          sameSite: "none",
          secure: true
        }
      }
    }
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://newspress-client-flame.vercel.app",
    "https://localhost:3000",
    process.env.TRUSTED_ORIGIN || ""
  ].filter(Boolean),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      status: { type: "string", required: false, defaultValue: "ACTIVE" },
      role: { type: "string", required: false, defaultValue: "USER" }
      // <--- add this
    }
  }
});

// src/modules/category/category.routes.ts
import express from "express";

// src/modules/category/category.service.ts
var createCategory = async (name) => {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return await prisma.category.create({
    data: { name, slug }
  });
};
var getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { createdAt: "asc" }
  });
};
var updateCategory = async (id, name) => {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return await prisma.category.update({
    where: { id },
    data: { name, slug }
  });
};
var deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id }
  });
};
var CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await CategoryService.createCategory(name);
    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};
var getCategories = async (req, res) => {
  try {
    const result = await CategoryService.getAllCategories();
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};
var updateCategory2 = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await CategoryService.updateCategory(id, name);
    res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Update failed"
    });
  }
};
var deleteCategory2 = async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Delete failed"
    });
  }
};
var CategoryController = {
  createCategory: createCategory2,
  getCategories,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/middleware/auth.ts
import { fromNodeHeaders } from "better-auth/node";
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized! Please login first."
        });
      }
      const userData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
        image: session.user.image
      };
      if (roles.length > 0 && !roles.includes(userData.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden! Only ${roles.join(", ")} can access this resource.`
        });
      }
      req.user = userData;
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during authentication"
      });
    }
  };
};
var auth_default = auth2;

// src/modules/category/category.routes.ts
var router = express.Router();
router.post(
  "/create-category",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.createCategory
);
router.get("/", CategoryController.getCategories);
router.patch(
  "/update-category/:id",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.updateCategory
);
router.delete(
  "/delete-category/:id",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.deleteCategory
);
var CategoryRoutes = router;

// src/modules/comment/comment.routes.ts
import express2 from "express";

// src/modules/comment/comment.service.ts
var createComment = async (data) => {
  return await prisma.comment.create({
    data: {
      text: data.text,
      postId: data.postId,
      userId: data.userId,
      parentId: data.parentId || null
    },
    include: {
      user: {
        select: { name: true, image: true, role: true }
      }
    }
  });
};
var getCommentsByPostId = async (postId) => {
  return await prisma.comment.findMany({
    where: {
      postId,
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
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var getCommentById = async (id) => {
  return await prisma.comment.findUnique({
    where: { id }
  });
};
var getAllComments = async () => {
  return await prisma.comment.findMany({
    include: {
      post: { select: { title: true, slug: true } },
      user: { select: { name: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var updateComment = async (id, text) => {
  return await prisma.comment.update({
    where: { id },
    data: { text }
  });
};
var deleteComment = async (id) => {
  return await prisma.comment.delete({
    where: { id }
  });
};
var CommentService = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getAllComments,
  getCommentsByPostId
};

// src/modules/comment/comment.controller.ts
var createComment2 = async (req, res) => {
  try {
    const { text, postId, parentId } = req.body;
    const userId = req.user.id;
    const result = await CommentService.createComment({ text, postId, userId, parentId });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await CommentService.getCommentsByPostId(postId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var getComments = async (req, res) => {
  try {
    const result = await CommentService.getAllComments();
    res.status(200).json({
      success: true,
      message: "Comments fetched successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch comments"
    });
  }
};
var updateComment2 = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const comment = await CommentService.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }
    const result = await CommentService.updateComment(commentId, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var deleteComment2 = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user;
    const comment = await CommentService.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.userId === user.id || user.role === "ADMIN") {
      await CommentService.deleteComment(commentId);
      return res.json({ message: "Comment deleted successfully" });
    }
    res.status(403).json({ message: "Unauthorized! Only owner or admin can delete" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var CommentController = {
  createComment: createComment2,
  updateComment: updateComment2,
  deleteComment: deleteComment2,
  getComments,
  getPostComments
};

// src/modules/comment/comment.routes.ts
var router2 = express2.Router();
router2.post(
  "/",
  auth_default("USER" /* USER */, "ADMIN" /* ADMIN */),
  CommentController.createComment
);
router2.get("/", CommentController.getComments);
router2.get("/post/:postId", CommentController.getPostComments);
router2.patch(
  "/:commentId",
  auth_default("USER" /* USER */, "ADMIN" /* ADMIN */),
  CommentController.updateComment
);
router2.delete(
  "/:commentId",
  auth_default("USER" /* USER */, "ADMIN" /* ADMIN */),
  CommentController.deleteComment
);
var CommentRoutes = router2;

// src/modules/news/news.routes.ts
import express3 from "express";

// src/modules/news/news.service.ts
var createNews = async (data, authorId) => {
  const baseSlug = data.title.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^\u0980-\u09FFa-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  const slug = `${baseSlug}-${Date.now()}`;
  return await prisma.post.create({
    data: {
      ...data,
      slug,
      authorId
    }
  });
};
var getAllNews = async () => {
  return await prisma.post.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true, image: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getNewsBySlug = async (slug) => {
  try {
    return await prisma.post.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1
        }
      },
      include: {
        category: true,
        author: {
          select: { name: true, image: true }
        },
        comments: {
          include: {
            user: { select: { name: true, image: true } }
          }
        }
      }
    });
  } catch (error) {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: { name: true, image: true }
        },
        comments: {
          include: {
            user: { select: { name: true, image: true } }
          }
        }
      }
    });
  }
};
var updateNews = async (id, data) => {
  let updateData = { ...data };
  if (data.title) {
    updateData.slug = data.title.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  }
  return await prisma.post.update({
    where: { id },
    data: updateData
  });
};
var deleteNews = async (id) => {
  return await prisma.post.delete({
    where: { id }
  });
};
var NewsService = {
  createNews,
  getAllNews,
  getNewsBySlug,
  updateNews,
  deleteNews
};

// src/modules/news/news.controller.ts
var createNews2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found in request"
      });
    }
    const result = await NewsService.createNews(req.body, user.id);
    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getAllNews2 = async (req, res) => {
  try {
    const result = await NewsService.getAllNews();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getSingleNews = async (req, res) => {
  try {
    const { slug } = req.params;
    const decodedSlug = decodeURIComponent(slug);
    const result = await NewsService.getNewsBySlug(decodedSlug);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "News not found in database"
      });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateNews2 = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "News ID is required" });
    }
    const result = await NewsService.updateNews(id, req.body);
    res.status(200).json({
      success: true,
      message: "News updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var deleteNews2 = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "News ID is required" });
    }
    await NewsService.deleteNews(id);
    res.status(200).json({ success: true, message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var NewsController = {
  createNews: createNews2,
  getAllNews: getAllNews2,
  getSingleNews,
  updateNews: updateNews2,
  deleteNews: deleteNews2
};

// src/modules/news/news.routes.ts
var router3 = express3.Router();
router3.post("/create-news", auth_default("ADMIN" /* ADMIN */), NewsController.createNews);
router3.get("/", NewsController.getAllNews);
router3.get("/slug/:slug", NewsController.getSingleNews);
router3.patch("/update-news/:id", NewsController.updateNews);
router3.delete("/:id", auth_default("ADMIN" /* ADMIN */), NewsController.deleteNews);
var NewsRoutes = router3;

// src/modules/stats/stats.routes.ts
import { Router } from "express";

// src/modules/stats/stats.service.ts
var getAdminStats = async () => {
  const [totalNews, totalUsers, totalCategories, totalComments, recentComments] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.category.count(),
    prisma.comment.count(),
    prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, image: true } },
        post: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    })
  ]);
  const categoryStats = await prisma.category.findMany({
    select: {
      name: true,
      _count: { select: { posts: true } }
    }
  });
  const monthlyNews = [
    { month: "Jan", total: await prisma.post.count({ where: { createdAt: { gte: /* @__PURE__ */ new Date("2026-01-01"), lte: /* @__PURE__ */ new Date("2026-01-31") } } }) },
    { month: "Feb", total: await prisma.post.count({ where: { createdAt: { gte: /* @__PURE__ */ new Date("2026-02-01"), lte: /* @__PURE__ */ new Date("2026-02-28") } } }) },
    { month: "Mar", total: 0 },
    { month: "Apr", total: 0 }
  ];
  return {
    totalNews,
    totalUsers,
    totalCategories,
    totalComments,
    recentComments,
    categoryStats: categoryStats.map((cat) => ({ name: cat.name, comments: cat._count.posts })),
    monthlyNews
  };
};
var StatsService = { getAdminStats };

// src/modules/stats/stats.controller.ts
var getStatsSummary = async (req, res) => {
  try {
    const stats = await StatsService.getAdminStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var StatsController = {
  getStatsSummary
};

// src/modules/stats/stats.routes.ts
var router4 = Router();
router4.get("/summary", auth_default("ADMIN" /* ADMIN */), StatsController.getStatsSummary);
var StatsRoutes = router4;

// src/modules/users/users.routes.ts
import express4 from "express";

// src/modules/users/users.service.ts
var getAllUsersFromDB = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var updateUserRoleInDB = async (userId, role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
};
var UserService = {
  getAllUsersFromDB,
  updateUserRoleInDB
};

// src/modules/users/users.controller.ts
var getAllUsers = async (req, res) => {
  try {
    const result = await UserService.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};
var updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await UserService.updateUserRoleInDB(id, role);
    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};
var UserController = {
  getAllUsers,
  updateUserRole
};

// src/modules/users/users.routes.ts
var router5 = express4.Router();
router5.get("/", auth_default("ADMIN" /* ADMIN */), UserController.getAllUsers);
router5.patch("/update-role/:id", auth_default("ADMIN" /* ADMIN */), UserController.updateUserRole);
var UserRoutes = router5;

// src/app.ts
var app = express5();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://newspress-client-flame.vercel.app"
    ],
    credentials: true
  })
);
app.use(express5.json());
app.all("/api/auth/*", (req, res) => {
  console.log("Auth route hit:", req.url);
  return toNodeHandler(auth)(req, res);
});
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/news", NewsRoutes);
app.use("/api/v1/comments", CommentRoutes);
app.use("/api/v1/stats", StatsRoutes);
app.use("/api/v1/users", UserRoutes);
app.get("/", (req, res) => {
  res.send("Newspress server  is running ...");
});
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
