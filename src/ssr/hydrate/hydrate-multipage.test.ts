import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../../component";
import { $div, $h1, $p, $section } from "../../elements";
import { Link, Router, useLocation } from "../../router";
import { enableClientMode, enableSSRMode, mockUseScope } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { renderToString } from "../render-to-string";
import { setSSRScope } from "../ssr-scope";
import { clearHydrationData, hydrate } from "./index";
import { $text } from "../../dom";

describe("Hydration of a multi-page app", () => {
  let container: HTMLElement;
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  mockUseScope();

  beforeEach(() => {
    container = document.createElement("div");
    cleanupClientMode = enableClientMode();
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    cleanupClientMode();
    setSSRScope(undefined);
  });

  const homePage = component(() => {
    const message = $text('Welcome to my homepage')
    return $section({ className: "home-page" }, [
      $h1(null, "Home"),
      $div(null, message),
    ]);
  }, "HomePage");

  const aboutPage = component(() => {
    return $section({ className: "about-page" }, [
      $h1(null, "About"),
      $p(null, "This page tells something about me"),
      $p(null, "I am a developer from Finland"),
    ]);
  }, "AboutPage");

  const notFoundPage = component(() => {
    return $section({ className: "not-found-page" }, [
      $h1(null, "Not Found"),
      $p(null, "The page you are looking for does not exist"),
      Link({ to: "/" }, "Back to home"),
    ]);
  }, "NotFoundPage");

  const navigation = component(() => {
    const location = useLocation();
    const links = [
      { to: "/", textContent: "Home" },
      { to: "/about", textContent: "About" },
    ];
    return links.map((link) =>
      Link({
        to: link.to,
        textContent: link.textContent,
        className: location.as<string>((l) => (l === link.to ? "active" : "")),
      }),
    );
  }, "Navigation");

  const app = component(() => {
    return [
      navigation(),
      Router(
        [
          ["/", homePage],
          ["/about", aboutPage],
        ],
        notFoundPage,
      ),
    ];
  }, "App");

  it("should hydrate a multi-page app", async () => {
    const cleanupSSR = enableSSRMode();

    const { html, hydrationData } = await renderToString(app, { path: "/" });

    cleanupSSR();

    container.innerHTML = html;
    console.log(html, JSON.stringify(hydrationData, null, 2));

    unmount = hydrate(app, container, hydrationData);

    expect(container.querySelector("section h1")?.textContent).toBe("Home");
    expect(container.querySelector("a.active")?.textContent).toBe("Home");
  });
});
