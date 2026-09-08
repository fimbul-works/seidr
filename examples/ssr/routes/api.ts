import type { Application, Request, Response } from "express";
import { getPost, getPosts } from "../blog-api.js";

/**
 * Setup API routes.
 * @param {Application} app
 */
export const setupApiRoutes = (app: Application): void => {
  app.get("/api/post", async (_req: Request, res: Response) => {
    const posts = await getPosts();
    res.json(posts);
  });

  app.get("/api/post/:slug", async (req: Request, res: Response) => {
    const post = await getPost(req.params.slug as string);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });
};
