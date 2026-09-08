import { createComponent } from "../../component/create-component.js";
import { List } from "../../components/list.js";
import { Suspense } from "../../components/suspense.js";
import { Switch } from "../../components/switch.js";
import { $text } from "../../dom/node/text.js";
import { $a } from "../../elements/a.js";
import { $div } from "../../elements/div.js";
import { $footer } from "../../elements/footer.js";
import { $h1 } from "../../elements/h1.js";
import { $h2 } from "../../elements/h2.js";
import { $li } from "../../elements/li.js";
import { $nav } from "../../elements/nav.js";
import { $p } from "../../elements/p.js";
import { $section } from "../../elements/section.js";
import { $ul } from "../../elements/ul.js";
import type { Value } from "../../observable/value.js";
import { hydrate } from "../../ssr/hydrate/hydrate.js";
import { renderToString } from "../../ssr/render-to-string.js";
import {
  clearHydrationData,
  clearTestAppState,
  enableClientMode,
  enableSSRMode,
  resetRequestIdCounter,
} from "../../test-setup/index.js";
import type { CleanupFunction } from "../../types.js";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { useNavigate } from "../hooks/use-navigate.js";
import { usePathname } from "../hooks/use-pathname.js";
import { clearRouterState } from "../test/index.js";
import { Link } from "./link.js";
import { Router } from "./router.js";

describe("Router Hydration", () => {
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  const HomePage = createComponent(() => {
    const message = $text("Welcome to my homepage");
    return $section({ className: "home-page" }, [$h1(null, "Home"), $div(null, message)]);
  }, "HomePage");

  const AboutPage = createComponent(() => {
    return $section({ className: "about-page" }, [
      $h1(null, "About"),
      $p(null, "This page tells something about me"),
      $p(null, "I am a developer from Finland"),
    ]);
  }, "AboutPage");

  const NotFoundPage = createComponent(() => {
    return $section({ className: "not-found-page" }, [
      $h1(null, "Not Found"),
      $p(null, "The page you are looking for does not exist"),
      Link({ to: "/" }, "Back to home"),
    ]);
  }, "NotFoundPage");

  const Navigation = createComponent(() => {
    const pathname = usePathname();
    const links = [
      { to: "/", textContent: "Home" },
      { to: "/about", textContent: "About" },
    ];
    return links.map((link) =>
      Link({
        to: link.to,
        textContent: link.textContent,
        className: pathname.as<string>((l) => (l === link.to ? "active" : "")),
      }),
    );
  }, "Navigation");

  const App = createComponent(() => {
    return [
      Navigation(),
      Router([
        { path: "/", component: HomePage, exact: true },
        { path: "/about", component: AboutPage },
        { path: "*", component: NotFoundPage },
      ]),
    ];
  }, "App");

  beforeAll(() => {
    cleanupClientMode = enableClientMode();
    resetRequestIdCounter();
    clearHydrationData();
  });

  afterEach(() => {
    clearRouterState();
    clearTestAppState();
    unmount?.();
    document.body.innerHTML = "";
  });

  afterAll(() => {
    resetRequestIdCounter();
    clearHydrationData();
    cleanupClientMode();
  });

  it("should mount default route when navigating to home", async () => {
    // 1. SSR a page
    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(App);
    cleanupSSR();

    // 2. Setup browser DOM
    const cleanupClient = enableClientMode();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    unmount = hydrate(App, container, hydrationData);
    cleanupClient();

    // Verify initial state
    expect(container.querySelector(".home-page")).toBeTruthy();
  });

  it("should unmount SSR fallback when navigating to a valid route", async () => {
    const AppWithUnknown = createComponent(() => {
      return [
        Navigation(),
        Router(
          [
            { path: "/", component: HomePage, exact: true },
            { path: "/about", component: AboutPage },
            { path: "*", component: NotFoundPage },
          ],
          {
            url: "/unknown",
          },
        ),
      ];
    }, "AppWithUnknown");

    // 1. SSR a 404 page
    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(AppWithUnknown);
    cleanupSSR();

    // 2. Setup browser DOM
    const cleanupClient = enableClientMode();
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    unmount = hydrate(AppWithUnknown, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".not-found-page")).toBeTruthy();

    // 4. Navigate to "/about"
    const navigate = useNavigate();
    navigate("/about");

    // Verify unmount
    expect(container.querySelector(".about-page")).toBeTruthy();
    expect(container.querySelector(".not-found-page")).toBeFalsy();

    cleanupClient();
  });

  it("should handle complex application hydration", async () => {
    type BlogPost = {
      slug: string;
      title: string;
      excerpt: string;
      date: string;
    };

    const Header = createComponent(
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

    const PostCard = createComponent(
      (post: Value<BlogPost>) =>
        $li({ className: "post-card" }, [
          $h2({}, [Link({ to: `/post/${post().slug}` }, post().title)]),
          $div({ className: "meta" }, new Date(post().date).toLocaleDateString()),
          $div({ className: "excerpt", innerHTML: post().excerpt }),
          Link({ to: `/post/${post().slug}`, className: "read-more" }, "Read more →"),
        ]),
      "PostCard",
    );

    const HomePageComp = createComponent(() => {
      const postsPromise: Promise<BlogPost[]> = Promise.resolve([
        {
          slug: "one",
          title: "First",
          excerpt: "This is the first post",
          date: "2026-01-01",
        },
      ]);

      return Suspense(
        postsPromise,
        createComponent(({ state, value, error }) => {
          return Switch(state, {
            pending: createComponent(() => $div({}, "Loading posts..."), "Pending"),
            resolved: createComponent(
              () =>
                $div({ className: "home-page" }, [
                  $h1({}, "Latest Posts"),
                  $ul({ className: "post-list" }, [List(value as Value<BlogPost[]>, (p) => p.slug, PostCard)]),
                ]),
              "Resolved",
            ),
            error: createComponent(() => $div({}, error()?.message || "Error"), "Error"),
          });
        }, "Posts"),
      );
    }, "HomePageComp");

    const BlogApp = createComponent(() => {
      return $div({ className: "app-container" }, [
        Header(),
        $div({ className: "main-content" }, [Router([{ path: "/", component: HomePageComp }])]),
        $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`),
      ]);
    }, "BlogApp");

    const cleanupSSR = enableSSRMode();
    const { hydrationData, html } = await renderToString(BlogApp);
    cleanupSSR();

    cleanupClientMode = enableClientMode();

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    unmount = hydrate(BlogApp, container, hydrationData);

    expect(container.innerHTML).toBe(html);

    cleanupClientMode();
  });
});
