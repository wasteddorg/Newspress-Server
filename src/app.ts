import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { CategoryRoutes } from "./modules/category/category.routes";
import { NewsRoutes } from "./modules/news/news.routes";
import { CommentRoutes } from "./modules/comment/comment.routes";
import { StatsRoutes } from "./modules/stats/stats.routes";
import { UserRoutes } from "./modules/users/users.routes";

const app: Application = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());

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
export default app;