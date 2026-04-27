import fs from "node:fs/promises";
import express from "express";
import type { ViteDevServer } from "vite";

// Constants
const port = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction ? await fs.readFile("./examples/ssr/index.html", "utf-8") : "";

// Create http server
const app = express();
app.use(express.json());

// Add Vite or respective production middlewares
let vite: ViteDevServer;

if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    configFile: "./vite.ssr.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const sirv = (await import("sirv")).default;
  app.use(base, sirv("./examples/ssr/dist", { extensions: [] }));
}

app.get(/.*/, async (req, res) => {
  try {
    let url = req.originalUrl.replace(base, "");
    if (!url.startsWith("/")) url = `/${url}`;

    // Ignore weird requests (source maps, devtools, favicon, etc)
    if (url.match(/\.(json|map|ico|png|svg)$/)) {
      res.status(404).end();
      return;
    }

    let template: string;
    let render: (url: string) => any;

    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile("./examples/ssr/index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("./entry-server.ts")).render;
    } else {
      template = templateHtml;
      render = (await import("./entry-server.js")).render;
    }

    // Data is now fetched by components themselves using inServer/inClient
    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "")
      .replace(
        "<!--app-state-->",
        `<script>window.__SEIDR_HYDRATION_DATA__ = ${JSON.stringify(rendered.hydrationData)}</script>`,
      );

    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      vite?.ssrFixStacktrace(e);
      res.status(500).end(e.stack);
      return;
    }
    res.status(500).end(String(e));
  }
});

// Start http server
app.listen(port, () => console.log(`Seidr TodoMVC SSR Example started at http://127.0.0.1:${port} (${process.env.NODE_ENV})`));
