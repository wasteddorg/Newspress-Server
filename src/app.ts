import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import { CategoryRoutes } from "./modules/category/category.routes";
import { CommentRoutes } from "./modules/comment/comment.routes";
import { NewsRoutes } from "./modules/news/news.routes";
import { StatsRoutes } from "./modules/stats/stats.routes";
import { UserRoutes } from "./modules/users/users.routes";

const app: Application = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://newspress-client-flame.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.all("/api/auth/*", (req, res) => {
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
export default app;
