import fs from "node:fs/promises";
import express, { type Request, type Response } from "express";
import type { ViteDevServer } from "vite";
import { loadTodos, saveTodos } from "./todo-db.js";
import type { Todo } from "./types.js";

// Constants
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 8080;
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction ? await fs.readFile("./examples/ssr/dist/client/index.html", "utf-8") : "";

// Create http server
const app = express();
app.use(express.json());

// Add Vite or respective production middlewares
let vite: ViteDevServer;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const sirv = (await import("sirv")).default;
  app.use(base, sirv("./examples/ssr/dist", { extensions: [] }));
}

app.get("/api/todos", (_req: Request, res: Response) => {
  res.json(loadTodos());
});

app.post("/api/todos", (req: Request, res: Response) => {
  const todos = req.body;

  if (Array.isArray(todos)) {
    const error = saveTodos(todos);
    return res.json({ error });
  }

  return res.json({ error: "Invalid array" });
});

// Serve HTML
app.get("/", async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, "");

    let template: string;
    let render: (url: string, todos?: Todo[]) => any;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile("./examples/ssr/index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/examples/ssr/entry-server.js")).render;
    } else {
      template = templateHtml;
      render = (await import("./entry-server.js")).render;
    }

    const todos = loadTodos();
    const rendered = await render(url, todos);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "")
      .replace("<!--app-state-->", JSON.stringify(rendered.hydrationData));

    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      vite?.ssrFixStacktrace(e);
      res.status(500).end(e.stack);
      return;
    }
    console.error(e);
    res.status(500).end(String(e));
  }
});

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
