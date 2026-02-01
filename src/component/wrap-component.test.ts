import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $div } from "../element/elements";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { isSeidrComponentFactory } from "../util/type-guards";
import { component } from "./component";
import { wrapComponent } from "./wrap-component";

describe("wrapComponent", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
  });

  afterEach(() => {
    restore();
  });

  it("should return existing factory if already wrapped", () => {
    const factory = component(() => $div({ textContent: "test" }));
    const wrapped = wrapComponent(factory);
    expect(wrapped).toBe(factory);
    expect(isSeidrComponentFactory(wrapped)).toBe(true);
  });

  it("should wrap a plain function", () => {
    const fn = () => $div({ textContent: "test" });
    const wrapped = wrapComponent(fn);
    expect(wrapped).not.toBe(fn);
    expect(isSeidrComponentFactory(wrapped)).toBe(true);

    // Check execution
    const comp = wrapped();
    expect(comp.element.textContent).toBe("test");
  });

  it("should handle props", () => {
    const fn = (props: { text: string }) => $div({ textContent: props.text });
    const wrapped = wrapComponent(fn);
    const comp = wrapped({ text: "hello" });
    expect(comp.element.textContent).toBe("hello");
  });
});
