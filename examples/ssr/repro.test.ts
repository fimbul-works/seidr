import { describe, expect, it } from "vitest";
import { renderToString } from "../../src/ssr/render-to-string";
import { reconstructComponentTree } from "../../src/ssr/structure/index";
import { enableSSRMode } from "../../src/test-setup/ssr-mode";
import { BlogApp } from "./app";

describe("BlogApp Hydration Repro", () => {
  it("captures correct structure map for BlogApp", async () => {
    const cleanup = enableSSRMode();
    try {
      const { hydrationData } = await renderToString(() => BlogApp());

      console.log("Captured Hydration Data:");
      console.log(JSON.stringify(hydrationData, null, 2));

      const { reconstructComponentTree } = await import("../../src/ssr/structure/index.js");
      const tree = reconstructComponentTree(hydrationData.components);

      expect(tree).toBeDefined();
      expect(tree).toHaveLength(1);
      expect(tree[0].tag).toBe("$:BlogApp-2");

      const blogAppEntryId = Object.keys(hydrationData.components).find((id) => id.startsWith("BlogApp"));
      const blogAppData = hydrationData.components[blogAppEntryId!];

      // Verification of flat format
      expect(Array.isArray(blogAppData)).toBe(true);

      // Verify tree structure instead of strict indices
      const appContainer = blogAppData.find((entry) => entry[0] === "div" && entry.length > 2);
      expect(appContainer).toBeDefined();
      expect(appContainer![0]).toBe("div");

      // Verify main content div (has children)
      const mainContentDiv = blogAppData.find((entry) => entry[0] === "div" && entry !== appContainer);
      expect(mainContentDiv).toBeDefined();
      // The bug is here: mainContentDiv should have a child index pointing to Router
      expect(mainContentDiv!.length).toBeGreaterThan(1);
    } finally {
      cleanup();
    }
  });
});
