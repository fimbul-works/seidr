import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setInternalAppState } from "../../app-state/app-state";
import { component } from "../../component/component";
import { Suspense, Switch } from "../../components";
import { List } from "../../components/list";
import { TAG_COMPONENT_PREFIX, TAG_TEXT } from "../../constants";
import { $a, $div, $footer, $h1, $h2, $li, $nav, $ul } from "../../elements";
import { Link } from "../../router/components/link";
import { Router } from "../../router/components/router";
import type { Seidr } from "../../seidr/seidr";
import { enableSSRMode, getAppState } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { renderToString } from "../render-to-string";

describe("buildStructureMap", () => {
  let cleanup: CleanupFunction;
  beforeEach(() => {
    cleanup = enableSSRMode();
    setInternalAppState(getAppState);
  });

  afterEach(() => cleanup?.());

  it("builds a simple structure map", async () => {
    const TestComponent = component(() => {
      return $div({}, "hello");
    }, "TestComponent");

    const { hydrationData } = await renderToString(() => TestComponent());

    // Find the TestComponent entry - its ID starts with TestComponent
    const compId = Object.keys(hydrationData.components).find((id) => id.startsWith("TestComponent"))!;
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
          Link({ to: "/", className: "brand" }, "Seidr Blog"),
          $div({ className: "links" }, [
            Link({ to: "/" }, "Home"),
            $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank" }, "GitHub"),
          ]),
        ]),
      "Header",
    );

    const PostCard = component(
      (post: BlogPost) =>
        $li({ className: "post-card" }, [
          $h2({}, [Link({ to: `/post/${post.slug}` }, post.title)]),
          $div({ className: "meta" }, new Date(post.date).toLocaleDateString()),
          $div({ className: "excerpt", innerHTML: post.excerpt }),
          Link({ to: `/post/${post.slug}`, className: "read-more" }, "Read more →"),
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
        $div({ className: "main-content" }, Router([["/", HomePage]])),
        $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`),
      ]);
    }, "BlogApp");

    const { hydrationData } = await renderToString(BlogApp);

    expect(hydrationData.components).toEqual({
      "BlogApp-1": [
        [`${TAG_COMPONENT_PREFIX}Header-2`],
        [`${TAG_COMPONENT_PREFIX}Router-5`],
        ["div", 1],
        ["footer", 4],
        [TAG_TEXT],
        ["div", 0, 2, 3],
      ],
      "Header-2": [
        [`${TAG_COMPONENT_PREFIX}Link-3`],
        [`${TAG_COMPONENT_PREFIX}Link-4`],
        ["a", 3],
        [TAG_TEXT],
        ["div", 1, 2],
        ["nav", 0, 4],
      ],
      "Link-3": [["a", 1], [TAG_TEXT]],
      "Link-4": [["a", 1], [TAG_TEXT]],
      "Router-5": [[`${TAG_COMPONENT_PREFIX}HomePage-6`]],
      "HomePage-6": [[`${TAG_COMPONENT_PREFIX}Suspense-7`]],
      "Suspense-7": [[`${TAG_COMPONENT_PREFIX}Posts-8`]],
      "Posts-8": [[`${TAG_COMPONENT_PREFIX}Switch-9`]],
      "Switch-9": [[`${TAG_COMPONENT_PREFIX}Resolved-10`]],
      "Resolved-10": [["h1", 1], [TAG_TEXT], [`${TAG_COMPONENT_PREFIX}List-11`], ["ul", 2], ["div", 0, 3]],
      "List-11": [
        [`${TAG_COMPONENT_PREFIX}PostCard-12`],
        [`${TAG_COMPONENT_PREFIX}PostCard-15`],
        [`${TAG_COMPONENT_PREFIX}PostCard-18`],
      ],
      "PostCard-12": [
        [`${TAG_COMPONENT_PREFIX}Link-13`],
        ["h2", 0],
        ["div", 3],
        [TAG_TEXT],
        ["div"],
        [`${TAG_COMPONENT_PREFIX}Link-14`],
        ["li", 1, 2, 4, 5],
      ],
      "Link-13": [["a", 1], [TAG_TEXT]],
      "Link-14": [["a", 1], [TAG_TEXT]],
      "PostCard-15": [
        [`${TAG_COMPONENT_PREFIX}Link-16`],
        ["h2", 0],
        ["div", 3],
        [TAG_TEXT],
        ["div"],
        [`${TAG_COMPONENT_PREFIX}Link-17`],
        ["li", 1, 2, 4, 5],
      ],
      "Link-16": [["a", 1], [TAG_TEXT]],
      "Link-17": [["a", 1], [TAG_TEXT]],
      "PostCard-18": [
        [`${TAG_COMPONENT_PREFIX}Link-19`],
        ["h2", 0],
        ["div", 3],
        [TAG_TEXT],
        ["div"],
        [`${TAG_COMPONENT_PREFIX}Link-20`],
        ["li", 1, 2, 4, 5],
      ],
      "Link-19": [["a", 1], [TAG_TEXT]],
      "Link-20": [["a", 1], [TAG_TEXT]],
    });
  });
});
