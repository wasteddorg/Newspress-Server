import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { CategoryRoutes } from "./modules/category/category.routes";

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

app.get("/", (req, res) => {
    res.send("Newspress server  is running ...");
});
export default app;