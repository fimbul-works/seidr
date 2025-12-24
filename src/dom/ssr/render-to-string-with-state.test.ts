import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr.js";
import { $ } from "../element.js";
import { clearHydrationContext } from "./hydration-context.js";
import { isInSSRMode, popSSRScope } from "./render-stack.js";
import { renderToStringWithState } from "./render-to-string-with-state.js";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("renderToStringWithState", () => {
  beforeEach(() => {
    // Enable SSR mode for all tests
    process.env.SEIDR_TEST_SSR = "true";
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear any remaining scopes
    while (isInSSRMode()) {
      popSSRScope();
    }

    // Clear hydration context
    clearHydrationContext();
  });

  it("should embed state in data attribute", () => {
    const count = new Seidr(42);

    const component = () => {
      // @ts-expect-error
      return $("div", { className: "counter" }, [`Count: ${count.value}`]);
    };

    const html = renderToStringWithState(component);

    expect(html).toContain("data-seidr-state=");
    expect(html).toContain("counter");
    expect(html).toContain("Count: 42");
  });

  it("should embed state in custom attribute", () => {
    const count = new Seidr(10);

    const component = () => {
      // @ts-expect-error
      return $("div", {}, [`${count.value}`]);
    };

    const html = renderToStringWithState(component, undefined, "data-state");

    expect(html).toContain("data-state=");
  });
});
