import { renderToString } from "../../src/index.ssr.js";
import { enableSSRMode } from "../../src/test-setup/ssr-mode.js";
import { BlogApp } from "./app.js";

async function inspect() {
  const cleanup = enableSSRMode();
  try {
    const { html, hydrationData } = await renderToString(() => BlogApp());
    console.log("HTML:", html.substring(0, 500) + "...");
    console.log("Hydration Data:", JSON.stringify(hydrationData, null, 2));

    const blogAppId = Object.keys(hydrationData.components).find((id) => id.startsWith("BlogApp"));
    console.log("\nBlogApp Map:", JSON.stringify(hydrationData.components[blogAppId!], null, 2));
  } finally {
    cleanup();
  }
}

inspect().catch(console.error);
