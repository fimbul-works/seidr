import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createComponent } from "../../component/create-component.js";
import { List } from "../../components/list.js";
import { Show } from "../../components/show.js";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX, SEIDR_ROOT_MARKER_PREFIX } from "../../constants.js";
import { isCommentNode } from "../../dom/type-guards.js";
import { $ } from "../../element/index.js";
import { onMounted } from "../../hooks/on-mounted.js";
import { DATA_KEY_STATE } from "../../observable/constants.js";
import type { Value } from "../../observable/types.js";
import { createValue } from "../../observable/value.js";
import { enableClientMode, enableSSRMode } from "../../test-setup/index.js";
import type { CleanupFunction } from "../../types.js";
import { renderToString } from "../render-to-string.js";
import { hydrate } from "./hydrate.js";

describe("Hydration Integration", () => {
  let container: HTMLElement;
  let cleanupMode: CleanupFunction;
  let unmount!: CleanupFunction;

  beforeEach(() => {
    cleanupMode = enableSSRMode();
    container = document.createElement("div");
  });

  afterEach(() => {
    unmount?.();
    cleanupMode?.();
  });

  function TestApp() {
    const count = createValue(0);
    const title = createValue("My App", { id: "title" });
    const items = createValue([1, 2, 3]);

    return $("div", { id: "app" }, [
      $("h1", { id: "title", textContent: title }),
      $("p", { id: "desc", textContent: count.as((c) => `Count: ${c}`) }),
      $("button", {
        id: "increment",
        onclick: () => count(count() + 1),
      }),
      $("ul", null, [
        List(
          items,
          (item) => String(item),
          (item: Value<number>) => $("li", { textContent: `Item ${item()}` }),
        ),
      ]),
    ]);
  }

  it("should natively reuse existing DOM nodes on successful hydration", async () => {
    // 1. SSR Pass
    const { html, hydrationData } = await renderToString(TestApp);

    // 2. Client Setup
    cleanupMode(); // Cleanup SSR mode
    cleanupMode = enableClientMode();
    container.innerHTML = html;

    // Grab references to the raw DOM nodes before hydration
    const originalAppDiv = container.querySelector("#app");
    const originalH1 = container.querySelector("h1");
    const originalButton = container.querySelector("button");
    const originalListItems = container.querySelectorAll("li");

    expect(originalAppDiv).toBeDefined();
    expect(originalH1?.textContent).toBe("My App");
    expect(originalListItems.length).toBe(3);

    // 3. Hydrate
    unmount = hydrate(TestApp, container, hydrationData);

    // 4. Verify Identity (nodes should not have changed references)
    const hydratedAppDiv = container.querySelector("#app");
    const hydratedH1 = container.querySelector("h1");
    const hydratedButton = container.querySelector("button");

    expect(hydratedAppDiv).toBe(originalAppDiv); // Same exact DOM node!
    expect(hydratedH1).toBe(originalH1);
    expect(hydratedButton).toBe(originalButton);
    expect(container.querySelectorAll("li").length).toBe(3);

    // 5. Verify Reactivity & Events
    hydratedButton?.click();
    expect(container.querySelector("#desc")?.textContent).toBe("Count: 1");
  });

  it("should bail out if there is a DOM mismatch (e.g. text difference)", async () => {
    const { html, hydrationData } = await renderToString(TestApp);

    cleanupMode(); // Cleanup SSR mode
    cleanupMode = enableClientMode();
    container.innerHTML = html;

    // Mutate the HTML to create a mismatch
    const h1 = container.querySelector("h1");
    if (h1) h1.textContent = "Tampered Title";

    // Re-hydrate
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    unmount = hydrate(TestApp, container, hydrationData);

    // The framework should correct it back to the client expected state
    expect(container.querySelector("h1")?.textContent).toBe("My App");

    consoleWarnSpy.mockRestore();
  });

  it("should bail out if there is a tag mismatch", async () => {
    const { html, hydrationData } = await renderToString(TestApp);

    cleanupMode(); // Cleanup SSR mode
    cleanupMode = enableClientMode();
    container.innerHTML = html;

    // Mutate the HTML to create a severe tag mismatch
    const appDiv = container.querySelector("#app");
    if (appDiv) {
      // replace h1 with h2
      appDiv.innerHTML = appDiv.innerHTML.replace("<h1", "<h2").replace("</h1>", "</h2>");
    }

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    unmount = hydrate(TestApp, container, hydrationData);

    // The framework should gracefully fallback to client rendering and recreate the h1
    expect(container.querySelector("h1")).toBeTruthy();
    expect(container.querySelector("h1")?.textContent).toBe("My App");

    consoleWarnSpy.mockRestore();
  });

  it("should work even if hydration data state is modified", async () => {
    // SSR output renders "My App"
    const { html, hydrationData } = await renderToString(TestApp);

    cleanupMode(); // Cleanup SSR mode
    cleanupMode = enableClientMode();
    container.innerHTML = html;

    // We deliberately alter the server state to something else before hydration
    const titleTuple = (hydrationData.data[DATA_KEY_STATE] as any[]).find((t: any[]) => t.includes("title"));
    if (titleTuple) {
      titleTuple[0] = "Modified App Title";
    }

    // Since the client receives this modified hydration state, the component will render with this new state
    unmount = hydrate(TestApp, container, hydrationData);

    // We expect the DOM to be smoothly updated to reflect the new state, rather than crashing
    expect(container.querySelector("h1")?.textContent).toBe("Modified App Title");
  });

  describe("Shared Container / document.body Hydration", () => {
    afterEach(() => {
      unmount?.();
      unmount = undefined as unknown as CleanupFunction;
      document.body.innerHTML = "";
    });

    it("should hydrate single-root app in document.body with siblings, whitespace, comments, and scripts before and after", async () => {
      const { html, hydrationData } = await renderToString(TestApp);

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = [
        '<header id="before-header">Before</header>',
        "\n  <!-- leading static comment -->\n  ",
        html,
        '\n  <script id="after-script"></script>',
        '\n  <footer id="after-footer">After</footer>\n',
      ].join("");

      const originalAppDiv = document.body.querySelector("#app");
      const originalButton = document.body.querySelector("#increment") as HTMLButtonElement | null;
      expect(originalAppDiv).not.toBeNull();
      expect(originalButton).not.toBeNull();

      unmount = hydrate(TestApp, document.body, hydrationData);

      expect(document.body.querySelectorAll("#app")).toHaveLength(1);
      expect(document.body.querySelector("#app")).toBe(originalAppDiv);
      expect(document.body.querySelector("#increment")).toBe(originalButton);
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual([
        "before-header",
        "app",
        "after-script",
        "after-footer",
      ]);

      originalButton?.click();
      expect(document.body.querySelector("#desc")?.textContent).toBe("Count: 1");

      unmount();
      unmount = undefined as unknown as CleanupFunction;

      expect(document.body.querySelector("#app")).toBeNull();
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual([
        "before-header",
        "after-script",
        "after-footer",
      ]);
      const remainingComments = Array.from(document.body.childNodes).filter((n) => isCommentNode(n));
      expect(remainingComments).toHaveLength(1);
      expect(remainingComments[0].textContent).toBe(" leading static comment ");
    });

    it("should ignore unrelated Seidr marker comments before and after the hydration location", async () => {
      const { html, hydrationData } = await renderToString(TestApp);

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = [
        '<!--$Portal-before--><div id="pre-portal">Pre</div><!--/Portal-before-->',
        html,
        '<!--$FocusGuard-after--><span id="post-guard">Post</span><!--/FocusGuard-after-->',
      ].join("");

      const originalAppDiv = document.body.querySelector("#app");
      const prePortal = document.body.querySelector("#pre-portal");
      const postGuard = document.body.querySelector("#post-guard");

      unmount = hydrate(TestApp, document.body, hydrationData);

      expect(document.body.querySelectorAll("#app")).toHaveLength(1);
      expect(document.body.querySelector("#app")).toBe(originalAppDiv);
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["pre-portal", "app", "post-guard"]);

      const button = document.body.querySelector("#increment") as HTMLButtonElement | null;
      button?.click();
      expect(document.body.querySelector("#desc")?.textContent).toBe("Count: 1");

      unmount();
      unmount = undefined as unknown as CleanupFunction;

      expect(document.body.querySelector("#app")).toBeNull();
      expect(document.body.querySelector("#pre-portal")).toBe(prePortal);
      expect(document.body.querySelector("#post-guard")).toBe(postGuard);
      const commentTexts = Array.from(document.body.childNodes)
        .filter((n) => isCommentNode(n))
        .map((n) => n.textContent);
      expect(commentTexts).toEqual(["$Portal-before", "/Portal-before", "$FocusGuard-after", "/FocusGuard-after"]);
    });

    it("should hydrate multi-root component in document.body with elements before and after", async () => {
      const Nav = createComponent(() => $("nav", { id: "site-nav", textContent: "Navigation" }), "Nav");
      const Main = createComponent(() => {
        const count = createValue(0);
        return $("main", { id: "site-main" }, [
          $("button", {
            id: "multi-btn",
            textContent: count.as((c) => `Hits: ${c}`),
            onclick: () => count(count() + 1),
          }),
        ]);
      }, "Main");
      const MultiApp = createComponent(() => [Nav(), Main()], "MultiApp");

      const { html, hydrationData } = await renderToString(MultiApp);

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${html}<div id="after">After</div>`;
      const originalNav = document.body.querySelector("#site-nav");
      const originalMain = document.body.querySelector("#site-main");

      unmount = hydrate(MultiApp, document.body, hydrationData);

      expect(document.body.querySelector("#site-nav")).toBe(originalNav);
      expect(document.body.querySelector("#site-main")).toBe(originalMain);
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual([
        "before",
        "site-nav",
        "site-main",
        "after",
      ]);

      (document.body.querySelector("#multi-btn") as HTMLButtonElement).click();
      expect(document.body.querySelector("#multi-btn")?.textContent).toBe("Hits: 1");

      unmount();
      unmount = undefined as unknown as CleanupFunction;

      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "after"]);
      expect(Array.from(document.body.childNodes).filter((n) => isCommentNode(n))).toHaveLength(0);
    });

    it("should keep recovered nodes between before and after siblings on root tag mismatch", async () => {
      const makeApp = (tag: "div" | "section") =>
        createComponent(() => $(tag, { id: "root-box", textContent: `Tag: ${tag}` }), "MismatchApp");

      const { html, hydrationData } = await renderToString(makeApp("div"));

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${html}<div id="after">After</div>`;

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      unmount = hydrate(makeApp("section"), document.body, hydrationData);
      warnSpy.mockRestore();

      expect(Array.from(document.body.children).map((el) => `${el.tagName}#${el.id}`)).toEqual([
        "DIV#before",
        "SECTION#root-box",
        "DIV#after",
      ]);
      expect(document.body.querySelector("#root-box")?.textContent).toBe("Tag: section");

      unmount();
      unmount = undefined as unknown as CleanupFunction;
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "after"]);
    });

    it("should keep expanded client nodes between before and after siblings on 1-to-N root mismatch", async () => {
      const ServerApp = createComponent(() => $("div", { id: "ssr-only", textContent: "Single" }), "ExpandApp");
      const ClientApp = createComponent(
        () => [
          $("header", { id: "client-header", textContent: "H" }),
          $("main", { id: "client-main", textContent: "M" }),
        ],
        "ExpandApp",
      );

      const { html, hydrationData } = await renderToString(ServerApp);

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${html}<div id="after">After</div>`;

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      unmount = hydrate(ClientApp, document.body, hydrationData);
      warnSpy.mockRestore();

      expect(document.body.querySelector("#ssr-only")).toBeNull();
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual([
        "before",
        "client-header",
        "client-main",
        "after",
      ]);

      unmount();
      unmount = undefined as unknown as CleanupFunction;
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "after"]);
    });

    it("should sweep stale SSR siblings on N-to-1 root contraction mismatch", async () => {
      const ServerApp = createComponent(
        () => [$("header", { id: "ssr-h", textContent: "H" }), $("main", { id: "ssr-m", textContent: "M" })],
        "ContractApp",
      );
      const ClientApp = createComponent(
        () => $("section", { id: "client-section", textContent: "Only" }),
        "ContractApp",
      );

      const { html, hydrationData } = await renderToString(ServerApp);

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${html}<div id="after">After</div>`;

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      unmount = hydrate(ClientApp, document.body, hydrationData);
      warnSpy.mockRestore();

      expect(document.body.querySelector("#ssr-h")).toBeNull();
      expect(document.body.querySelector("#ssr-m")).toBeNull();
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "client-section", "after"]);

      unmount();
      unmount = undefined as unknown as CleanupFunction;
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "after"]);
    });

    it("should insert client root node between before and after siblings when SSR rendered empty root", async () => {
      const ServerApp = createComponent(() => null, "EmptyApp");
      const ClientApp = createComponent(() => $("div", { id: "client-added", textContent: "Added" }), "EmptyApp");

      const { html, hydrationData } = await renderToString(ServerApp);

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${html}<div id="after">After</div>`;

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      unmount = hydrate(ClientApp, document.body, hydrationData);
      warnSpy.mockRestore();

      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "client-added", "after"]);

      unmount();
      unmount = undefined as unknown as CleanupFunction;
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "after"]);
    });

    it("should preserve synchronous Show swaps triggered inside onMounted during document.body hydration", async () => {
      const makeShowApp = (isClient: boolean) =>
        createComponent(() => {
          const flag = createValue(true);
          if (isClient) {
            onMounted(() => flag(false));
          }
          return Show(
            flag,
            () => $("div", { id: "initial-view", textContent: "Initial" }),
            () => $("div", { id: "swapped-view", textContent: "Swapped" }),
          );
        }, "ShowMountApp");

      const { html, hydrationData } = await renderToString(makeShowApp(false));

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${html}<div id="after">After</div>`;

      unmount = hydrate(makeShowApp(true), document.body, hydrationData);

      expect(document.body.querySelector("#initial-view")).toBeNull();
      expect(document.body.querySelector("#swapped-view")?.textContent).toBe("Swapped");
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "swapped-view", "after"]);

      unmount();
      unmount = undefined as unknown as CleanupFunction;
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "after"]);
    });

    it("should hydrate anonymous SSR wrapper with named client component (single-root and multi-root)", async () => {
      // Single-root anonymous SSR -> named client component
      const singleSSR = await renderToString(() => $("div", { id: "anon-single", textContent: "Hello" }));

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${singleSSR.html}<div id="after">After</div>`;
      const originalSingle = document.body.querySelector("#anon-single");
      const NamedSingleApp = createComponent(
        () => $("div", { id: "anon-single", textContent: "Hello" }),
        "NamedSingle",
      );

      unmount = hydrate(NamedSingleApp, document.body, singleSSR.hydrationData);

      expect(document.body.querySelector("#anon-single")).toBe(originalSingle);
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "anon-single", "after"]);

      unmount();
      unmount = undefined as unknown as CleanupFunction;

      // Multi-root anonymous SSR -> named client component (markers aliased without duplication)
      cleanupMode();
      cleanupMode = enableSSRMode();
      const multiSSR = await renderToString(() => [
        $("header", { id: "anon-header", textContent: "H" }),
        $("main", { id: "anon-main", textContent: "M" }),
      ]);

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = `<div id="before">Before</div>${multiSSR.html}<div id="after">After</div>`;
      const originalHeader = document.body.querySelector("#anon-header");
      const originalMain = document.body.querySelector("#anon-main");
      const NamedMultiApp = createComponent(
        () => [$("header", { id: "anon-header", textContent: "H" }), $("main", { id: "anon-main", textContent: "M" })],
        "NamedMulti",
      );

      unmount = hydrate(NamedMultiApp, document.body, multiSSR.hydrationData);

      expect(document.body.querySelector("#anon-header")).toBe(originalHeader);
      expect(document.body.querySelector("#anon-main")).toBe(originalMain);
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual([
        "before",
        "anon-header",
        "anon-main",
        "after",
      ]);

      // Outer ctxID root markers + 2 inner component markers (no duplicates created)
      const comments = Array.from(document.body.childNodes)
        .filter((n) => isCommentNode(n))
        .map((n) => n.textContent);
      expect(comments).toHaveLength(4);
      expect(comments[0]).toBe(
        `${SEIDR_COMPONENT_START_PREFIX}${SEIDR_ROOT_MARKER_PREFIX}${multiSSR.hydrationData.ctxID}`,
      );
      expect(comments[3]).toBe(
        `${SEIDR_COMPONENT_END_PREFIX}${SEIDR_ROOT_MARKER_PREFIX}${multiSSR.hydrationData.ctxID}`,
      );

      unmount();
      unmount = undefined as unknown as CleanupFunction;
      expect(Array.from(document.body.children).map((el) => el.id)).toEqual(["before", "after"]);
      expect(Array.from(document.body.childNodes).filter((n) => isCommentNode(n))).toHaveLength(0);
    });

    it("should preserve outer element, children, and sibling components when Show flips false->true during hydration", async () => {
      let clientAccountName: Value<string | null> | undefined;
      let clientAuthToken: Value<string | null> | undefined;

      const makeMirageApp = (isClient: boolean) => {
        const Dropdown = createComponent(
          ({ accountName }: { accountName: Value<string | null> }) =>
            $("span", {
              id: "user-dropdown",
              textContent: accountName.as((name) => `Logged in as ${name}`),
            }),
          "DropdownMenu",
        );

        const Header = createComponent(() => {
          const accountName = createValue<string | null>(isClient ? "Claus" : null, {
            id: "accountName",
            hydrate: false,
          });
          const authToken = createValue<string | null>(isClient ? "tok" : null, {
            id: "authToken",
            hydrate: false,
          });
          if (isClient) {
            clientAccountName = accountName;
            clientAuthToken = authToken;
          }

          return $("div", { className: authToken.as((token) => `${!token ? "hidden " : ""}app-header`) }, [
            $("div", {}, $("h1", { className: "app-title" }, $("a", { href: "/" }, "Mirage Reborn"))),
            Show(
              accountName.as((acc) => !!acc),
              () => Dropdown({ accountName }),
            ),
          ]);
        }, "Header");

        const Main = createComponent(() => {
          const count = createValue(0);
          return $("main", { id: "main-screen" }, [
            $("button", {
              id: "main-btn",
              textContent: count.as((c) => `Count: ${c}`),
              onclick: () => count(count() + 1),
            }),
          ]);
        }, "Main");

        return createComponent(() => $("div", { className: "app-wrapper" }, [Header(), Main()]), "MirageApp");
      };

      const { html, hydrationData } = await renderToString(makeMirageApp(false));
      expect(html).toContain('class="hidden app-header"');

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = html;
      const originalHeader = document.body.querySelector(".app-header");
      const originalLink = document.body.querySelector("a");
      const originalMain = document.body.querySelector("#main-screen");
      expect(originalHeader).not.toBeNull();
      expect(originalLink).not.toBeNull();
      expect(originalMain).not.toBeNull();

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        unmount = hydrate(makeMirageApp(true), document.body, hydrationData);
      } finally {
        const errorCalls = errorSpy.mock.calls.slice();
        errorSpy.mockRestore();
        warnSpy.mockRestore();
        expect(errorCalls).toHaveLength(0);
      }

      expect(document.body.querySelectorAll(".app-header")).toHaveLength(1);
      expect(document.body.querySelector(".app-header")).toBe(originalHeader);
      expect(originalHeader?.className).toBe("app-header");
      expect(document.body.querySelector("a")).toBe(originalLink);
      expect(originalLink?.textContent).toBe("Mirage Reborn");
      expect(document.body.querySelector("#main-screen")).toBe(originalMain);

      const dropdown = document.body.querySelector("#user-dropdown");
      expect(dropdown).not.toBeNull();
      expect(dropdown?.textContent).toBe("Logged in as Claus");
      expect(isCommentNode(dropdown?.previousSibling)).toBe(true);
      expect(dropdown?.previousSibling?.textContent).toMatch(/^\$/);
      expect(isCommentNode(dropdown?.nextSibling)).toBe(true);
      expect(dropdown?.nextSibling?.textContent).toMatch(/^\//);

      // Verify wrapper child order: Header first, Main second
      const wrapper = document.body.querySelector(".app-wrapper");
      expect(wrapper?.firstElementChild).toBe(originalHeader);
      expect(wrapper?.lastElementChild).toBe(originalMain);

      // Verify sibling interactivity preserved
      (document.body.querySelector("#main-btn") as HTMLButtonElement).click();
      expect(document.body.querySelector("#main-btn")?.textContent).toBe("Count: 1");

      // Verify Show cleanup still works on logout
      clientAccountName!(null);
      clientAuthToken!(null);
      expect(document.body.querySelector("#user-dropdown")).toBeNull();
      expect(originalHeader?.className).toBe("hidden app-header");
      expect(document.body.querySelector("a")).toBe(originalLink);
    });

    it("should sweep stale Show nodes and preserve outer element and sibling components when Show flips true->false during hydration", async () => {
      const makeMirageApp = (isClient: boolean) => {
        const Dropdown = createComponent(
          () => $("span", { id: "user-dropdown", textContent: "Logged in as Claus" }),
          "DropdownMenu",
        );

        const Header = createComponent(() => {
          const accountName = createValue<string | null>(isClient ? null : "Claus", {
            id: "accountName",
            hydrate: false,
          });
          const authToken = createValue<string | null>(isClient ? null : "tok", {
            id: "authToken",
            hydrate: false,
          });

          return $("div", { className: authToken.as((token) => `${!token ? "hidden " : ""}app-header`) }, [
            $("div", {}, $("h1", { className: "app-title" }, $("a", { href: "/" }, "Mirage Reborn"))),
            Show(
              accountName.as((acc) => !!acc),
              () => Dropdown(),
            ),
          ]);
        }, "Header");

        const Main = createComponent(() => $("main", { id: "main-screen", textContent: "Main" }), "Main");

        return createComponent(() => $("div", { className: "app-wrapper" }, [Header(), Main()]), "MirageApp");
      };

      const { html, hydrationData } = await renderToString(makeMirageApp(false));
      expect(html).toContain('id="user-dropdown"');

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = html;
      const originalHeader = document.body.querySelector(".app-header");
      const originalLink = document.body.querySelector("a");
      const originalMain = document.body.querySelector("#main-screen");

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        unmount = hydrate(makeMirageApp(true), document.body, hydrationData);
      } finally {
        const errorCalls = errorSpy.mock.calls.slice();
        errorSpy.mockRestore();
        warnSpy.mockRestore();
        expect(errorCalls).toHaveLength(0);
      }

      expect(document.body.querySelectorAll(".app-header")).toHaveLength(1);
      expect(document.body.querySelector(".app-header")).toBe(originalHeader);
      expect(originalHeader?.className).toBe("hidden app-header");
      expect(document.body.querySelector("a")).toBe(originalLink);
      expect(originalLink?.textContent).toBe("Mirage Reborn");
      expect(document.body.querySelector("#user-dropdown")).toBeNull();
      expect(document.body.querySelector("#main-screen")).toBe(originalMain);
    });

    it("should hydrate sibling child component and parent element without cursor drift when extra client Show precedes sibling", async () => {
      const makeParentApp = (isClient: boolean) => {
        const Extra = createComponent(() => $("span", { id: "extra-box", textContent: "Extra" }), "Extra");
        const Footer = createComponent(() => $("footer", { id: "footer-box", textContent: "Footer" }), "Footer");

        return createComponent(() => {
          const cond = createValue(isClient, { id: "cond", hydrate: false });
          return $("div", { id: "parent-box" }, [Show(cond, () => Extra()), Footer()]);
        }, "ParentApp");
      };

      const { html, hydrationData } = await renderToString(makeParentApp(false));

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = html;
      const originalParent = document.body.querySelector("#parent-box");
      const originalFooter = document.body.querySelector("#footer-box");

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        unmount = hydrate(makeParentApp(true), document.body, hydrationData);
      } finally {
        const errorCalls = errorSpy.mock.calls.slice();
        errorSpy.mockRestore();
        warnSpy.mockRestore();
        expect(errorCalls).toHaveLength(0);
      }

      expect(document.body.querySelector("#parent-box")).toBe(originalParent);
      expect(document.body.querySelector("#footer-box")).toBe(originalFooter);

      const extra = document.body.querySelector("#extra-box");
      expect(extra).not.toBeNull();
      expect(isCommentNode(extra?.previousSibling)).toBe(true);
      expect(isCommentNode(extra?.nextSibling)).toBe(true);
      expect(Array.from(originalParent?.children ?? []).map((el) => el.id)).toEqual(["extra-box", "footer-box"]);
    });

    it("should keep sibling component IDs aligned when multiple Show calls share condition and flip before sibling", async () => {
      const makeParentApp = (isClient: boolean) => {
        const Fallback = createComponent(() => $("span", { id: "fallback-box", textContent: "Fallback" }), "ShowView");
        const First = createComponent(() => $("span", { id: "first-box", textContent: "First" }), "ShowView");
        const Second = createComponent(() => $("span", { id: "second-box", textContent: "Second" }), "ShowView");
        const Footer = createComponent(() => $("footer", { id: "footer-box", textContent: "Footer" }), "Footer");

        return createComponent(() => {
          const cond = createValue(isClient, { id: "cond", hydrate: false });
          return $("div", { id: "parent-box" }, [
            Show(
              cond,
              () => First(),
              () => Fallback(),
            ),
            Show(cond, () => Second()),
            Footer(),
          ]);
        }, "ParentApp");
      };

      const { html, hydrationData } = await renderToString(makeParentApp(false));
      expect(html).toContain('id="fallback-box"');

      cleanupMode();
      cleanupMode = enableClientMode();

      document.body.innerHTML = html;
      const originalParent = document.body.querySelector("#parent-box");
      const originalFooter = document.body.querySelector("#footer-box");

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        unmount = hydrate(makeParentApp(true), document.body, hydrationData);
      } finally {
        const errorCalls = errorSpy.mock.calls.slice();
        errorSpy.mockRestore();
        warnSpy.mockRestore();
        expect(errorCalls).toHaveLength(0);
      }

      expect(document.body.querySelector("#parent-box")).toBe(originalParent);
      expect(document.body.querySelector("#footer-box")).toBe(originalFooter);
      expect(document.body.querySelector("#fallback-box")).toBeNull();

      const first = document.body.querySelector("#first-box");
      const second = document.body.querySelector("#second-box");
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(isCommentNode(first?.previousSibling)).toBe(true);
      expect(isCommentNode(first?.nextSibling)).toBe(true);
      expect(isCommentNode(second?.previousSibling)).toBe(true);
      expect(isCommentNode(second?.nextSibling)).toBe(true);
      expect(Array.from(originalParent?.children ?? []).map((el) => el.id)).toEqual([
        "first-box",
        "second-box",
        "footer-box",
      ]);
    });

    it("should reconcile a component returning Show directly for both false->true and true->false hydration transitions", async () => {
      let clientCond: ReturnType<typeof createValue<boolean>> | undefined;
      const makeDirectShowApp = (isClient: boolean, initialCond: boolean) => {
        const Extra = createComponent(() => $("span", { id: "extra-box", textContent: "Extra" }), "Extra");
        const Footer = createComponent(() => $("footer", { id: "footer-box", textContent: "Footer" }), "Footer");
        const cond = createValue(initialCond, { id: "direct-cond", hydrate: false });
        if (isClient) {
          clientCond = cond;
        }
        const DirectShow = createComponent(() => Show(cond, () => Extra()), "DirectShow");

        return createComponent(() => $("div", { id: "parent-box" }, [DirectShow(), Footer()]), "DirectShowParent");
      };

      // Case 1: SSR false -> Client true
      {
        const { html, hydrationData } = await renderToString(makeDirectShowApp(false, false));

        cleanupMode();
        cleanupMode = enableClientMode();

        document.body.innerHTML = html;
        const originalParent = document.body.querySelector("#parent-box");
        const originalFooter = document.body.querySelector("#footer-box");

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        try {
          unmount = hydrate(makeDirectShowApp(true, true), document.body, hydrationData);
        } finally {
          const errorCalls = errorSpy.mock.calls.slice();
          errorSpy.mockRestore();
          warnSpy.mockRestore();
          expect(errorCalls).toHaveLength(0);
        }

        expect(document.body.querySelector("#parent-box")).toBe(originalParent);
        expect(document.body.querySelector("#footer-box")).toBe(originalFooter);

        const extra = document.body.querySelector("#extra-box");
        expect(extra).not.toBeNull();
        expect(isCommentNode(extra?.previousSibling)).toBe(true);
        expect(isCommentNode(extra?.nextSibling)).toBe(true);
        expect(Array.from(originalParent?.children ?? []).map((el) => el.id)).toEqual(["extra-box", "footer-box"]);

        // Reactive toggle off still cleans up
        clientCond!(false);
        expect(document.body.querySelector("#extra-box")).toBeNull();
        unmount();
        cleanupMode();
        cleanupMode = enableSSRMode();
      }

      // Case 2: SSR true -> Client false
      {
        const { html, hydrationData } = await renderToString(makeDirectShowApp(false, true));
        expect(html).toContain('id="extra-box"');

        cleanupMode();
        cleanupMode = enableClientMode();

        document.body.innerHTML = html;
        const originalParent = document.body.querySelector("#parent-box");
        const originalFooter = document.body.querySelector("#footer-box");

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        try {
          unmount = hydrate(makeDirectShowApp(true, false), document.body, hydrationData);
        } finally {
          const errorCalls = errorSpy.mock.calls.slice();
          errorSpy.mockRestore();
          warnSpy.mockRestore();
          expect(errorCalls).toHaveLength(0);
        }

        expect(document.body.querySelector("#parent-box")).toBe(originalParent);
        expect(document.body.querySelector("#footer-box")).toBe(originalFooter);
        expect(document.body.querySelector("#extra-box")).toBeNull();
        expect(Array.from(originalParent?.children ?? []).map((el) => el.id)).toEqual(["footer-box"]);

        // Reactive toggle on renders into the right spot before Footer
        clientCond!(true);
        expect(Array.from(originalParent?.children ?? []).map((el) => el.id)).toEqual(["extra-box", "footer-box"]);
      }
    });
  });
});
