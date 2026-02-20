import { afterEach, beforeEach, expect, it } from "vitest";
import { $div } from "../elements";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { isComponentFactory } from "../util/type-guards/seidr-dom-types";
import { component } from "./component";
import { wrapComponent } from "./wrap-component";

describeDualMode("wrapComponent", () => {
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
    expect(isComponentFactory(wrapped)).toBe(true);
  });

  it("should wrap a plain function", () => {
    const fn = () => $div({ textContent: "test" });
    const wrapped = wrapComponent(fn);
    expect(wrapped).not.toBe(fn);
    expect(isComponentFactory(wrapped)).toBe(true);

    // Check execution
    const comp = wrapped();
    expect((comp.element as HTMLElement).textContent).toBe("test");
  });

  it("should handle props", () => {
    const fn = (props: { text: string }) => $div({ textContent: props.text });
    const wrapped = wrapComponent(fn);
    const comp = wrapped({ text: "hello" });
    expect((comp.element as HTMLElement).textContent).toBe("hello");
  });
});
