import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setAppStateProvider } from "../../app-state/app-state.js";
import { createComponent } from "../../component/index.js";
import { $text } from "../../dom/node/text.js";
import { $button, $div, $form, $input, $label, $span } from "../../elements/index.js";
import { enableClientMode, enableSSRMode, getAppState } from "../../test-setup/index.js";
import type { CleanupFunction } from "../../types.js";
import { renderToString } from "../render-to-string.js";
import { clearHydrationData } from "./storage.js";
import { hydrate } from "./hydrate.js";

describe("Hydration Context", () => {
  let cleanupClientMode: CleanupFunction;
  let cleanupSsrMode: CleanupFunction;
  let unmount: CleanupFunction;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    cleanupSsrMode = enableSSRMode();
    setAppStateProvider(getAppState);
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    cleanupSsrMode?.();
    cleanupClientMode?.();
  });

  it("Test 1: Simple DOM Element Text child", async () => {
    const SimpleComponent = createComponent(() => {
      return $div({ className: "wrapper" }, "Hello Seidr");
    }, "SimpleComponent");

    const { hydrationData, html } = await renderToString(SimpleComponent);
    container.innerHTML = html;

    expect(container.textContent).toContain("Hello Seidr");

    // Switch to Client mode
    cleanupClientMode = enableClientMode();

    unmount = hydrate(SimpleComponent, container, hydrationData);

    // Validate bindings and structure didn't blow up
    expect(container.innerHTML).toBe(html);
  });

  it("Test 2: HTML Form, fields, sibling buttons", async () => {
    const LoginFormComponent = createComponent(() => {
      return $form({ className: "login-form", onsubmit: (e: Event) => e.preventDefault() }, [
        $div({ className: "field" }, [
          $label({ htmlFor: "username" }, "Username"),
          $input({ id: "username", type: "text" }),
        ]),
        $div({ className: "field" }, [
          $label({ htmlFor: "password" }, "Password"),
          $input({ id: "password", type: "password" }),
        ]),
        $button({ type: "submit" }, "Login"),
      ]);
    }, "LoginFormComponent");

    const { hydrationData, html } = await renderToString(LoginFormComponent);
    container.innerHTML = html;

    cleanupClientMode = enableClientMode();
    unmount = hydrate(LoginFormComponent, container, hydrationData);

    expect(container.querySelector("input")?.type).toBe("text");
    expect(container.querySelector("button")?.textContent).toBe("Login");
  });

  it("Test 3: Multiple root elements returned by component array root", async () => {
    const MultiRootComponent = createComponent(() => {
      const s1 = $span({ className: "item-1" }, "First Item");
      const t = $text("A text node sibling root!");
      const s2 = $span({ className: "item-2" }, "Second Item");
      return [s1, t, s2];
    }, "MultiRootComponent");

    const WrapperApp = createComponent(() => {
      return $div({ id: "app-root" }, [MultiRootComponent()]);
    }, "WrapperApp");

    const { hydrationData, html } = await renderToString(WrapperApp);
    container.innerHTML = html;

    cleanupClientMode = enableClientMode();
    unmount = hydrate(WrapperApp, container, hydrationData);

    expect(container.innerHTML).toBe(html);
  });
});
