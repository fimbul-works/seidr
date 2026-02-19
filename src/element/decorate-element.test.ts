import { expect, it, vi } from "vitest";
import { SEIDR_CLEANUP } from "../constants";
import { describeDualMode } from "../test-setup";
import { decorateElement } from "./decorate-element";

describeDualMode("decorateElement", ({ getDOMFactory, isSSR }) => {
  it("should decorate element with on method", () => {
    const factory = getDOMFactory();
    const el = factory.createElement("div");
    const decorated = decorateElement(el, []);
    expect(decorated.on).toBeTypeOf("function");

    if (isSSR) return;

    const handler = vi.fn();
    const cleanup = decorated.on("click", handler);
    expect(cleanup).toBeTypeOf("function");

    // In JSDOM this would work, in SSR it's a no-op but shouldn't throw
    el.dispatchEvent?.(new Event("click"));
    expect(handler).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("should decorate element with clearChildren method", () => {
    const factory = getDOMFactory();
    const el = factory.createElement("div");
    el.appendChild(factory.createElement("span"));
    el.appendChild(factory.createTextNode("text"));

    const decorated = decorateElement(el, []);
    expect(el.childNodes.length).toBe(2);

    (decorated as any).clearChildren();
    expect(el.childNodes.length).toBe(0);
  });

  it("should handle cleanup", () => {
    const factory = getDOMFactory();
    const el = factory.createElement("div");
    let cleaned = false;
    const decorated = decorateElement(el, [
      () => {
        cleaned = true;
      },
    ]);

    (decorated as any)[SEIDR_CLEANUP]();
    expect(cleaned).toBe(true);
  });
});
