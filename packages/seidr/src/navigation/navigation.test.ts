import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_NAVIGATION_HANDLERS } from "./constants.js";
import { getNavigationHandlers } from "./get-navigation-handlers.js";
import { navigate } from "./navigate.js";
import { registerNavigationHandler } from "./register-navigation-hander.js";
import type { NavigationHandler } from "./types.js";

describe("Navigation Utilities", () => {
  beforeEach(() => {
    getAppState().deleteData(DATA_KEY_NAVIGATION_HANDLERS);
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
});
