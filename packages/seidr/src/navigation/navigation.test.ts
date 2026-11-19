import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppState } from "../app-state/class-app-state.js";
import { getAppState, setAppStateProvider } from "../app-state/get-app-state.js";
import { $ } from "../element/create-element.js";
import { getPropMutators } from "../element/prop-mutators.js";
import type { SeidrElementProps } from "../element/types.js";
import { unwrapValue } from "../observable/unwrap-value.js";
import { createValue } from "../observable/value.js";
import { DATA_KEY_CURRENT_URL, DATA_KEY_HANDLED_LINK_PROPS, DATA_KEY_NAVIGATION_HANDLERS } from "./constants.js";
import { getCurrentUrl, setCurrentUrl } from "./current-url.js";
import { getNavigationHandlers } from "./get-navigation-handlers.js";
import { handleLinkProps } from "./handle-link-props.js";
import { isUrlActive } from "./is-url-active.js";
import { navigate } from "./navigate.js";
import { registerNavigationHandler } from "./register-navigation-hander.js";
import type { NavigationHandler } from "./types.js";

describe("Navigation Utilities", () => {
  beforeEach(() => {
    getAppState().deleteData(DATA_KEY_NAVIGATION_HANDLERS);
    getAppState().deleteData(DATA_KEY_CURRENT_URL);
    getAppState().deleteData(DATA_KEY_HANDLED_LINK_PROPS);
    vi.restoreAllMocks();
  });

  describe("registerNavigationHandler & getNavigationHandlers", () => {
    it("returns empty array initially", () => {
      expect(getNavigationHandlers()).toEqual([]);
    });

    it("registers a navigation handler and returns unregister function", () => {
      const handler: NavigationHandler = () => true;
      const unregister = registerNavigationHandler(handler);

      expect(getNavigationHandlers()).toEqual([handler]);

      unregister();
      expect(getNavigationHandlers()).toEqual([]);
    });

    it("warns when registering the same handler multiple times", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const handler: NavigationHandler = () => true;

      const unregister1 = registerNavigationHandler(handler);
      const unregister2 = registerNavigationHandler(handler);

      expect(warnSpy).toHaveBeenCalledWith("Navigation handler already registered");
      expect(getNavigationHandlers()).toEqual([handler]);

      unregister2();
      expect(getNavigationHandlers()).toEqual([]);
      unregister1();
      expect(getNavigationHandlers()).toEqual([]);
    });

    it("returns a defensive copy from getNavigationHandlers", () => {
      const handler: NavigationHandler = () => true;
      registerNavigationHandler(handler);

      const handlers = getNavigationHandlers();
      handlers.push(() => false);

      expect(getNavigationHandlers()).toHaveLength(1);
    });
  });

  describe("navigate", () => {
    it("returns false when no handlers are registered", () => {
      expect(navigate("/test")).toBe(false);
    });

    it("executes handlers in registration order until one returns true", () => {
      const executionOrder: string[] = [];

      const handler1: NavigationHandler = (target) => {
        executionOrder.push(`handler1:${target}`);
        return false;
      };

      const handler2: NavigationHandler = (target) => {
        executionOrder.push(`handler2:${target}`);
        return true;
      };

      const handler3: NavigationHandler = (target) => {
        executionOrder.push(`handler3:${target}`);
        return true;
      };

      registerNavigationHandler(handler1);
      registerNavigationHandler(handler2);
      registerNavigationHandler(handler3);

      const handled = navigate("/dashboard");

      expect(handled).toBe(true);
      expect(executionOrder).toEqual(["handler1:/dashboard", "handler2:/dashboard"]);
    });

    it("passes target and options to handlers", () => {
      const received: { target: any; options: any }[] = [];

      const handler: NavigationHandler = (target, options) => {
        received.push({ target, options });
        return true;
      };

      registerNavigationHandler(handler);

      const targetUrl = new URL("https://example.com/path");
      const options = { replace: true, state: { from: "home" } };

      navigate(targetUrl, options);

      expect(received).toEqual([{ target: targetUrl, options }]);
    });

    it("handles numeric delta targets", () => {
      const received: any[] = [];

      const handler: NavigationHandler = (target) => {
        received.push(target);
        return true;
      };

      registerNavigationHandler(handler);

      expect(navigate(-1)).toBe(true);
      expect(received).toEqual([-1]);
    });

    it("returns false if all handlers return false or undefined", () => {
      registerNavigationHandler(() => false);
      registerNavigationHandler(() => undefined);

      expect(navigate("/unhandled")).toBe(false);
    });

    it("respects unregistering so unregistered handler is not called", () => {
      const spy1 = vi.fn().mockReturnValue(false);
      const spy2 = vi.fn().mockReturnValue(true);

      const unregister1 = registerNavigationHandler(spy1);
      registerNavigationHandler(spy2);

      unregister1();

      expect(navigate("/test")).toBe(true);
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  describe("getCurrentUrl & setCurrentUrl", () => {
    it("returns default URL when not initialized", () => {
      const current = getCurrentUrl();
      expect(current()).toBeInstanceOf(URL);
    });

    it("updates URL via setCurrentUrl", () => {
      setCurrentUrl("http://localhost/new-path");
      const current = getCurrentUrl();
      expect(current().pathname).toBe("/new-path");
    });

    it("resolves relative path via setCurrentUrl", () => {
      setCurrentUrl("http://localhost/base/");
      setCurrentUrl("subpage");
      const current = getCurrentUrl();
      expect(current().pathname).toBe("/base/subpage");
    });
  });

  describe("isUrlActive", () => {
    it("reactively determines if path is active", () => {
      setCurrentUrl("http://localhost/dashboard");
      const isActive = isUrlActive("/dashboard");
      expect(isActive()).toBe(true);

      setCurrentUrl("http://localhost/settings");
      expect(isActive()).toBe(false);
    });

    it("matches subpaths when exact is false", () => {
      setCurrentUrl("http://localhost/dashboard/analytics");
      const isActive = isUrlActive("/dashboard", { exact: false });
      expect(isActive()).toBe(true);
    });

    it("does not match subpaths when exact is true", () => {
      setCurrentUrl("http://localhost/dashboard/analytics");
      const isActive = isUrlActive("/dashboard", { exact: true });
      expect(isActive()).toBe(false);
    });

    it("root path only matches exact root even if exact is false", () => {
      setCurrentUrl("http://localhost/dashboard");
      const isActive = isUrlActive("/");
      expect(isActive()).toBe(false);

      setCurrentUrl("http://localhost/");
      expect(isActive()).toBe(true);
    });

    it("matches query parameters and hash", () => {
      setCurrentUrl("http://localhost/items?tab=1#details");
      const withTab = isUrlActive("/items?tab=1");
      const withHash = isUrlActive("/items?tab=1#details");
      const wrongTab = isUrlActive("/items?tab=2");
      const wrongHash = isUrlActive("/items?tab=1#other");

      expect(withTab()).toBe(true);
      expect(withHash()).toBe(true);
      expect(wrongTab()).toBe(false);
      expect(wrongHash()).toBe(false);
    });

    it("rejects different origins", () => {
      setCurrentUrl("http://localhost/dashboard");
      const isOtherOrigin = isUrlActive("https://example.com/dashboard");
      expect(isOtherOrigin()).toBe(false);
    });
  });

  describe("handleLinkProps", () => {
    it("returns props unchanged when no href and no disabled prop", () => {
      const el = document.createElement("a");
      const props = { className: "my-link" };
      const result = handleLinkProps(el, props as any);
      expect(result).toBe(props);
    });

    it("intercepts click and navigates for relative href", () => {
      const handler = vi.fn().mockReturnValue(true);
      registerNavigationHandler(handler);

      const el = document.createElement("a");
      const props = handleLinkProps(el, { href: "/about" });

      const event = new MouseEvent("click", { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      (props as any).onclick(event);

      expect(handler).toHaveBeenCalledWith("/about", undefined);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("does not prevent default if navigate returns false", () => {
      const el = document.createElement("a");
      const props = handleLinkProps(el, { href: "/external-path" });

      const event = new MouseEvent("click", { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      (props as any).onclick(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it("does not intercept when modifier keys are pressed", () => {
      const handler = vi.fn().mockReturnValue(true);
      registerNavigationHandler(handler);

      const el = document.createElement("a");
      const props = handleLinkProps(el, { href: "/about" });

      const event = new MouseEvent("click", { ctrlKey: true, cancelable: true });
      (props as any).onclick(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it("does not intercept when target is _blank", () => {
      const handler = vi.fn().mockReturnValue(true);
      registerNavigationHandler(handler);

      const el = document.createElement("a");
      const props = handleLinkProps(el, { href: "/about", target: "_blank" });

      const event = new MouseEvent("click", { cancelable: true });
      (props as any).onclick(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it("prevents default and blocks navigation when disabled", () => {
      const handler = vi.fn().mockReturnValue(true);
      registerNavigationHandler(handler);

      const el = document.createElement("a");
      const props = handleLinkProps(el, { href: "/about", disabled: true });

      const event = new MouseEvent("click", { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      (props as any).onclick(event);

      expect(handler).not.toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(unwrapValue((props as any).href)).toBeUndefined();
      expect(unwrapValue((props as any).ariaDisabled)).toBe("true");
      expect(unwrapValue((props as any).dataDisabled)).toBe("");
      expect(unwrapValue((props as any).role)).toBe("link");
    });

    it("handles reactive disabled value changes", () => {
      const disabled = createValue(false);
      const el = document.createElement("a");
      const props = handleLinkProps(el, { href: "/about", disabled });

      expect((props as any).href()).toBe("/about");
      expect((props as any).ariaDisabled()).toBeUndefined();
      expect((props as any).role()).toBeUndefined();

      disabled(true);

      expect((props as any).href()).toBeUndefined();
      expect((props as any).ariaDisabled()).toBe("true");
      expect((props as any).role()).toBe("link");
    });

    it("assigns role=link and tabIndex=0 for non-anchor elements and omits href", () => {
      const el = document.createElement("span");
      const props = handleLinkProps(el, { href: "/about" });

      expect(unwrapValue((props as any).role)).toBe("link");
      expect(unwrapValue((props as any).tabIndex)).toBe(0);
      expect((props as any).href).toBeUndefined();
    });

    it("handles reactive href updates alone and combined with reactive disabled", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      const href = createValue("/initial");
      const el = document.createElement("a");
      const props = handleLinkProps(el, { href });

      expect((props as any).href()).toBe("/initial");
      href("/updated");
      expect((props as any).href()).toBe("/updated");

      (props as any).onclick(new MouseEvent("click", { cancelable: true }));
      expect(handler).toHaveBeenCalledWith("/updated", undefined);

      const disabled = createValue(false);
      const combined = handleLinkProps(el, { href, disabled });
      expect((combined as any).href()).toBe("/updated");
      href("/next");
      expect((combined as any).href()).toBe("/next");
      disabled(true);
      expect((combined as any).href()).toBeUndefined();
      disabled(false);
      expect((combined as any).href()).toBe("/next");

      unregister();
    });

    it("handles URL objects for href", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      const el = document.createElement("a");
      const baseOrigin = window.location.origin !== "null" ? window.location.origin : "http://localhost";
      const sameOriginUrl = new URL("/docs?q=1#sec", baseOrigin);
      const sameOrigin = handleLinkProps(el, { href: sameOriginUrl });
      expect((sameOrigin as any).href).toBe(sameOriginUrl.href);

      (sameOrigin as any).onclick(new MouseEvent("click", { cancelable: true }));
      expect(handler).toHaveBeenCalledWith("/docs?q=1#sec", undefined);

      handler.mockClear();
      const external = handleLinkProps(el, { href: new URL("https://example.com/docs") });
      (external as any).onclick(new MouseEvent("click", { cancelable: true }));
      expect(handler).not.toHaveBeenCalled();

      unregister();
    });

    it("unwraps reactive target and download values", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      const el = document.createElement("a");
      const target = createValue("_self");
      const download = createValue(false);
      const props = handleLinkProps(el, { href: "/file", target, download });

      (props as any).onclick(new MouseEvent("click", { cancelable: true }));
      expect(handler).toHaveBeenCalledTimes(1);

      target("_blank");
      (props as any).onclick(new MouseEvent("click", { cancelable: true }));
      expect(handler).toHaveBeenCalledTimes(1);

      target("_self");
      download(true);
      (props as any).onclick(new MouseEvent("click", { cancelable: true }));
      expect(handler).toHaveBeenCalledTimes(1);

      unregister();
    });

    it("handles Enter key activation on non-anchor elements and blocks when disabled", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      const span = $("span", { href: "/profile" } as SeidrElementProps<any>, "Profile");
      span.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      expect(handler).toHaveBeenCalledWith("/profile", undefined);

      handler.mockClear();
      const disabledSpan = $("span", { href: "/profile", disabled: true } as SeidrElementProps<any>, "Profile");
      expect(disabledSpan.hasAttribute("tabindex")).toBe(false);
      disabledSpan.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      expect(handler).not.toHaveBeenCalled();

      const userKeydown = vi.fn((e: KeyboardEvent) => e.preventDefault());
      const cancelledSpan = $(
        "span",
        { href: "/profile", onkeydown: userKeydown } as SeidrElementProps<any>,
        "Profile",
      );
      cancelledSpan.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      expect(userKeydown).toHaveBeenCalledTimes(1);
      expect(handler).not.toHaveBeenCalled();

      unregister();
    });

    it("leaves metadata tags <link> and <base> unchanged", () => {
      const linkEl = document.createElement("link");
      const linkProps = { rel: "stylesheet", href: "/app.css" };
      expect(handleLinkProps(linkEl, linkProps as any)).toBe(linkProps);

      const baseEl = document.createElement("base");
      const baseProps = { href: "/" };
      expect(handleLinkProps(baseEl, baseProps as any)).toBe(baseProps);
    });

    it("is idempotent when called multiple times on already handled props", () => {
      const handler = vi.fn().mockReturnValue(false);
      const unregister = registerNavigationHandler(handler);

      const el = document.createElement("a");
      const first = handleLinkProps(el, { href: "/about" });
      const second = handleLinkProps(el, first);

      expect(second).toBe(first);
      (second as any).onclick(new MouseEvent("click", { cancelable: true }));
      expect(handler).toHaveBeenCalledTimes(1);

      unregister();
    });

    it("registers and unregisters the href prop mutator cleanly via registerNavigationHandler", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      expect(getPropMutators("href")).toContain(handleLinkProps);

      const span = $("span", { href: "/span-route" } as SeidrElementProps<any>, "Go");
      expect(span.getAttribute("role")).toBe("link");
      expect(span.getAttribute("tabindex")).toBe("0");
      expect(span.hasAttribute("href")).toBe(false);
      span.click();
      expect(handler).toHaveBeenCalledWith("/span-route", undefined);

      const metaLink = $("link", { rel: "stylesheet", href: "/app.css" });
      expect(metaLink.hasAttribute("role")).toBe(false);
      expect(metaLink.getAttribute("href")).toBe("/app.css");

      unregister();
      expect(getPropMutators("href")).toEqual([]);
    });

    it("stores handled props WeakSet in AppState for cross-request isolation", () => {
      const prevProvider = getAppState;
      const appStateA = new AppState(1);
      const appStateB = new AppState(2);

      try {
        setAppStateProvider(() => appStateA);
        const el = document.createElement("a");
        expect(appStateA.hasData(DATA_KEY_HANDLED_LINK_PROPS)).toBe(false);

        const handled = handleLinkProps(el, { href: "/about" });
        expect(appStateA.hasData(DATA_KEY_HANDLED_LINK_PROPS)).toBe(true);
        expect(appStateA.getData<WeakSet<object>>(DATA_KEY_HANDLED_LINK_PROPS).has(handled)).toBe(true);
        expect(handleLinkProps(el, handled)).toBe(handled);

        // Switching AppState does not leak handledProps tracking across requests
        setAppStateProvider(() => appStateB);
        expect(appStateB.hasData(DATA_KEY_HANDLED_LINK_PROPS)).toBe(false);
        const rehandled = handleLinkProps(el, handled);
        expect(rehandled).not.toBe(handled);
        expect(appStateB.getData<WeakSet<object>>(DATA_KEY_HANDLED_LINK_PROPS).has(rehandled)).toBe(true);
      } finally {
        setAppStateProvider(prevProvider);
      }
    });
  });
});
