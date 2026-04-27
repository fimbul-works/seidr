import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setAppStateProvider } from "../../app-state/app-state";
import { component } from "../../component/component";
import { Suspense, Switch } from "../../components";
import { List } from "../../components/list";
import { TAG_COMPONENT_PREFIX, TAG_TEXT } from "../../constants";
import { $a, $div, $footer, $h1, $h2, $li, $nav, $span, $ul } from "../../elements";
import type { Seidr } from "../../seidr/seidr";
import { enableSSRMode, getAppState } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { renderToString } from "../render-to-string";
import { buildStructureMap } from "./build-structure-map";

describe("buildStructureMap", () => {
  let cleanup: CleanupFunction;
  beforeEach(() => {
    cleanup = enableSSRMode();
    setAppStateProvider(getAppState);
  });

  afterEach(() => cleanup?.());

  it("builds a simple structure map", async () => {
    const TestComponent = component(() => {
      return $div({}, "hello");
    }, "TestComponent");

    const { hydrationData } = await renderToString(() => TestComponent());

    // Find the TestComponent entry - its ID starts with TestComponent or a prefix
    const compId = Object.keys(hydrationData.components).find((id) => id.includes("TestComponent-"))!;
    const structure = hydrationData.components[compId];

    expect(structure).toEqual([["div", 1], [TAG_TEXT]]);
  });

  it("should handle complex application structure", async () => {
    type BlogPost = {
      slug: string;
      title: string;
      excerpt: string;
      date: string;
    };

    const Header = component(
      () =>
        $nav({ className: "navbar" }, [
          $a({ href: "/", className: "brand" }, "Seidr Blog"),
          $div({ className: "links" }, [
            $a({ href: "/", className: "home" }, "Home"),
            $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank" }, "GitHub"),
          ]),
        ]),
      "Header",
    );

    const PostCard = component(
      (post: Seidr<BlogPost>) =>
        $li({ className: "post-card" }, [
          $h2({}, [$a({ href: `/post/${post.value.slug}` }, post.value.title)]),
          $div({ className: "meta" }, new Date(post.value.date).toLocaleDateString()),
          $div({ className: "excerpt", innerHTML: post.value.excerpt }),
          $a({ href: `/post/${post.value.slug}`, className: "read-more" }, "Read more →"),
        ]),
      "PostCard",
    );

    const HomePage = component(() => {
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
        postsPromise!,
        component(({ state, value, error }) => {
          return Switch(state, {
            pending: component(() => $div({}, "Loading posts..."), "Pending"),
            resolved: component(
              () =>
                $div({ className: "home-page" }, [
                  $h1({}, "Latest Posts"),
                  $ul({ className: "post-list" }, [List(value as Seidr<BlogPost[]>, (p) => p.slug, PostCard)]),
                ]),
              "Resolved",
            ),
            error: component(() => $div({}, error.value?.message || "Error"), "Error"),
          });
        }, "Posts"),
      );
    }, "HomePage");

    const BlogApp = component(() => {
      return $div({ className: "app-container" }, [
        Header(),
        $div({ className: "main-content" }, HomePage()),
        $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`),
      ]);
    }, "BlogApp");

    const { hydrationData } = await renderToString(BlogApp);

    const comps = hydrationData.components;
    const keys = Object.keys(comps);
    const kBlogApp = keys.find((k) => k.includes("BlogApp-"))!;
    const kHeader = keys.find((k) => k.includes("Header-"))!;
    const kHomePage = keys.find((k) => k.includes("HomePage-"))!;
    const kResolved = keys.find((k) => k.includes("Resolved-"))!;
    const kList = keys.find((k) => k.includes("List-"))!;

    expect(kBlogApp).toBeDefined();

    // BlogApp should have Header and Router as children
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

    // Resolved state should map h1, List and ul
    expect(comps[kResolved]).toEqual([
      ["h1", 1],
      [TAG_TEXT],
      [`${TAG_COMPONENT_PREFIX}${kList.split(":")[1]}`],
      ["ul", 2],
      ["div", 0, 3],
    ]);
  });

  describe("Edge Cases", () => {
    it("should throw SeidrError for unknown child types", () => {
      const Comp = component(() => $div())();
      const fakeNode = { nodeType: 999 } as any;

      // Manually push an unknown type into createdIndex (which is an Array)
      (Comp.createdIndex as any).push(fakeNode);

      expect(() => buildStructureMap(Comp)).toThrow("Unknown component child");
    });

    it("should correctly index multiple children in a nested element", async () => {
      const TestComponent = component(() => {
        return $div({}, [$span({ textContent: "1" }), $span({ textContent: "2" })]);
      }, "Nested");

      const { hydrationData } = await renderToString(TestComponent);
      const compId = Object.keys(hydrationData.components).find((k) => k.includes("Nested-"))!;
      const structure = hydrationData.components[compId];

      // Structure generation logic for nested elements (Bottom-up creation):
      // index 0: span 1
      // index 1: span 2
      // index 2: div (root)
      const divTuple = structure.find((t) => t[0] === "div");
      expect(divTuple).toContain(0); // Index of span 1
      expect(divTuple).toContain(1); // Index of span 2
    });
  });
});
