import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { List } from "../../components/list";
import { $ } from "../../element";
import { $article, $div, $h1, $h2, $main } from "../../elements";
import { Seidr } from "../../seidr";
import { enableClientMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { inServer } from "../../util/environment";
import { renderToString } from "../render-to-string";
import { clearHydrationData, hydrate } from "./index";

describe("Hydration List", () => {
  let container: HTMLElement;
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction | undefined;

  beforeEach(() => {
    container = document.createElement("div");
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    if (cleanupClientMode) {
      cleanupClientMode();
    }
  });

  const Link = (props: { to: string; textContent: string }) =>
    $("a", { href: props.to, textContent: props.textContent, className: "link" });

  const getExcerpt = (blog: any) => `${blog.content.split(". ").at(0)}...`;

  const BlogPage = () => {
    const blogs = new Seidr<any[]>([], { id: "blogs" });

    inServer(() => {
      const posts = [
        { slug: "seidr-release", title: "Seidr 1.0.0", content: "Seidr 1.0.0 is now released on NPM..." },
        { slug: "hello-world", title: "Hello World!", content: "Welcome to FimbulWorks! This is my homepage, and creative outlet..." },
      ];
      blogs.value = posts.map((post) => ({ ...post, content: getExcerpt(post) }));
    });

    const BlogPreview = (blog: any) => {
      const to = `/blog/${blog.slug}`;
      return $article({}, [
        $h2({ textContent: blog.title }),
        $div({ innerHTML: `<p>${blog.content}</p>` }),
        Link({ to, textContent: "Read more..." }),
      ]);
    };

    return $main({ id: "app" }, [$h1({ textContent: "Blog" }), List(blogs, (b) => b.slug, BlogPreview)]);
  };

  it("should nicely hydrate a List component and handle deep mismatches gracefully", async () => {
    // 1. SSR Pass
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(BlogPage);
    delete process.env.SEIDR_TEST_SSR;

    // 2. Client Setup
    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    // SIMULATED MISMATCH:
    // Let's modify the DOM directly before hydration, simulating that the client-side
    // rendering generated a DIFFERENT div structure (e.g. differently rendered markdown).
    const articles = container.querySelectorAll("article");
    const div = articles[0].querySelector("div");
    if (div) {
        // Wait! The user said: middle post without a body (link points to `/seidr-release`)
        // If the first post (seidr-release) had a mismatch...
        div.innerHTML = `<span>MISMATCH</span>`;
    }

    // 3. Hydrate
    unmount = hydrate(BlogPage, container, hydrationData);

    // Wait for microtasks
    await new Promise((r) => setTimeout(r, 10));

    console.log("HYDRATED OUTER HTML:", container.innerHTML);

    const hydratedArticles = container.querySelectorAll("article");
    console.log("AT END ARTICLES COUNT:", hydratedArticles.length);
  });
});
