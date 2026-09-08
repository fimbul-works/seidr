import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setAppStateProvider } from "../../app-state/app-state.js";
import { createComponent } from "../../component/index.js";
import type { SeidrComponent, SeidrComponentFactory } from "../../component/types.js";
import { Suspense, Switch } from "../../components/index.js";
import { List } from "../../components/list.js";
import { TAG_COMPONENT_PREFIX, TAG_TEXT } from "../../constants.js";
import { $a, $div, $footer, $h1, $h2, $li, $nav, $span, $ul } from "../../elements/index.js";
import type { Value } from "../../observable/value.js";
import { enableSSRMode, getAppState } from "../../test-setup/index.js";
import type { CleanupFunction } from "../../types.js";
import { renderToString } from "../render-to-string.js";
import { buildStructureMap } from "./build-structure-map.js";

describe("buildStructureMap", () => {
  let cleanup: CleanupFunction;
  beforeEach(() => {
    cleanup = enableSSRMode();
    setAppStateProvider(getAppState);
  });

  afterEach(() => cleanup?.());

  it("builds a simple structure map", async () => {
    const TestComponent = createComponent(() => {
      return $div(null, "hello");
    }, "TestComponent");

    const { hydrationData } = await renderToString(() => TestComponent());

    const compKey = Object.keys(hydrationData.components!).find((k) =>
      hydrationData.components![k].some((t) => t[0] === "div"),
    )!;
    const structure = hydrationData.components![compKey];

    expect(structure).toEqual([["div", 1], [TAG_TEXT]]);
  });

  it("should handle complex application structure", async () => {
    type BlogPost = {
      slug: string;
      title: string;
      excerpt: string;
      date: string;
    };

    let headerComp: SeidrComponentFactory;
    let homePageComp: SeidrComponentFactory;
    let resolvedComp: SeidrComponentFactory;
    let listComp: SeidrComponent;

    const Header = createComponent(() => {
      headerComp = Header;
      return $nav({ className: "navbar" }, [
        $a({ href: "/", className: "brand" }, "Seidr Blog"),
        $div({ className: "links" }, [
          $a({ href: "/", className: "home" }, "Home"),
          $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank" }, "GitHub"),
        ]),
      ]);
    }, "Header");

    const PostCard = createComponent(
      (post: Value<BlogPost>) =>
        $li({ className: "post-card" }, [
          $h2(null, [$a({ href: `/post/${post().slug}` }, post().title)]),
          $div({ className: "meta" }, new Date(post().date).toLocaleDateString()),
          $div({ className: "excerpt", innerHTML: post().excerpt }),
          $a({ href: `/post/${post().slug}`, className: "read-more" }, "Read more →"),
        ]),
      "PostCard",
    );

    const HomePage = createComponent(() => {
      homePageComp = HomePage as any;
      const postsPromise: Promise<BlogPost[]> = Promise.resolve([
        {
          slug: "one",
          title: "First",
          excerpt: "This is the first post",
          date: "2026-01-01",
        },
        {
          slug: "two",
          title: "Second",
          excerpt: "This is the second post",
          date: "2026-02-01",
        },
        {
          slug: "three",
          title: "Third",
          excerpt: "This is the third post",
          date: "2026-03-01",
        },
      ]);

      return Suspense(
        postsPromise,
        createComponent(({ state, value, error }: any) => {
          return Switch(state, {
            pending: createComponent(() => $div(null, "Loading posts..."), "Pending"),
            resolved: createComponent(() => {
              resolvedComp = createComponent as any;
              const list = List(value as Value<BlogPost[]>, (p) => p.slug, PostCard);
              listComp = list;
              return $div({ className: "home-page" }, [
                $h1(null, "Latest Posts"),
                $ul({ className: "post-list" }, [list]),
              ]);
            }, "Resolved"),
            error: createComponent(() => $div(null, error()?.message || "Error"), "Error"),
          });
        }, "Posts"),
      );
    }, "HomePage");

    const BlogApp = createComponent(() => {
      return $div({ className: "app-container" }, [
        Header(),
        $div({ className: "main-content" }, HomePage()),
        $footer(null, `© ${new Date().getFullYear()} Seidr Blog Example`),
      ]);
    }, "BlogApp");

    const { hydrationData } = await renderToString(BlogApp);

    const comps = hydrationData.components!;
    const keys = Object.keys(comps);
    const kBlogApp = keys.find((k) => k.includes("BlogApp-"))!;
    const kHeader = keys.find((k) => k.includes("Header-"))!;
    const kHomePage = keys.find((k) => k.includes("HomePage-"))!;
    const kResolved = keys.find((k) => k.includes("Resolved-"))!;
    const kList = keys.find((k) => k.includes("List-"))!;

    expect(kBlogApp).toBeDefined();

    // BlogApp should have Header and HomePage as children
    expect(comps[kBlogApp]).toEqual([
      [`${TAG_COMPONENT_PREFIX}${kHeader.split(":")[1]}`],
      [`${TAG_COMPONENT_PREFIX}${kHomePage.split(":")[1]}`],
      ["div", 1],
      ["footer", 4],
      [TAG_TEXT],
      ["div", 0, 2, 3],
    ]);

    // Header has Links
    expect(comps[kHeader]).toEqual([
      ["a", 1],
      [TAG_TEXT],
      ["a", 3],
      [TAG_TEXT],
      ["a", 5],
      [TAG_TEXT],
      ["div", 2, 4],
      ["nav", 0, 6],
    ]);

    // Resolved state should map List, h1, and ul
    expect(comps[kResolved]).toEqual([
      [`${TAG_COMPONENT_PREFIX}${kList.split(":")[1]}`],
      ["h1", 2],
      [TAG_TEXT],
      ["ul", 0],
      ["div", 1, 3],
    ]);
  });

  describe("Edge Cases", () => {
    it("should throw SeidrError for unknown child types", () => {
      const Comp = createComponent(() => $div())();
      const fakeNode = { nodeType: 999 } as any;

      // Manually push an unknown type into createdIndex (which is an Array)
      (Comp.createdIndex as any).push(fakeNode);

      expect(() => buildStructureMap(Comp)).toThrow("Unknown component child");
    });

    it("should correctly index multiple children in a nested element", async () => {
      const TestComponent = createComponent(() => {
        return $div(null, [$span({ textContent: "1" }), $span({ textContent: "2" })]);
      }, "Nested");

      const { hydrationData } = await renderToString(TestComponent);
      const compKey = Object.keys(hydrationData.components!)[0];
      const structure = hydrationData.components![compKey];

      // Structure generation logic for nested elements:
      // index 0: span 1
      // index 1: span 2
      // index 2: div (root)
      const divTuple = structure.find((t) => t[0] === "div");
      expect(divTuple).toEqual(["div", 0, 1]);
    });

    it("should preserve DOM child order when text precedes a sub-element child", async () => {
      const TestComponent = createComponent(() => {
        return $h1({ className: "title" }, ["FIMBUL", $span({ className: "accent" }, "WORKS")]);
      }, "TitleComp");

      const { hydrationData } = await renderToString(TestComponent);
      const compKey = Object.keys(hydrationData.components!)[0];
      const structure = hydrationData.components![compKey];

      // index 0: span
      // index 1: text "WORKS"
      // index 2: h1
      // index 3: text "FIMBUL"
      // In DOM: h1 has childNodes [ text "FIMBUL" (3), span (0) ]
      const h1Tuple = structure.find((t) => t[0] === "h1");
      expect(h1Tuple).toEqual(["h1", 3, 0]);
    });
  });
});
