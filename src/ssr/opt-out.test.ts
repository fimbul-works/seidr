import { describe, expect, it } from "vitest";
import { Seidr } from "../core/seidr";
import { NO_HYDRATE } from "../core/util/index";
import { renderToString } from "./render-to-string";

describe("Seidr Hydration Opt-out", () => {
  it("should not include opt-out Seidr instances in hydration data", async () => {
    // Component with one hydrated and one non-hydrated Seidr
    const TestComponent = () => {
      const hydrated = new Seidr("keep me");
      hydrated.observe(() => {}); // Force registration

      const transient = new Seidr("drop me", NO_HYDRATE);
      transient.observe(() => {}); // Attempt registration (should be ignored)

      return `<div>${hydrated.value} ${transient.value}</div>`;
    };

    const { hydrationData } = await renderToString(TestComponent as any);

    // Get keys from observables map
    const keys = Object.keys(hydrationData.observables).map(Number);
    const values = Object.values(hydrationData.observables);

    // Should contain "keep me"
    expect(values).toContain("keep me");

    // Should NOT contain "drop me"
    expect(values).not.toContain("drop me");
  });

  it("should not register bindings for opt-out Seidr instances", async () => {
    /*
      We need to verify that even if a non-hydrated Seidr is bound,
      it doesn't show up in the bindings map or cause errors.

      However, renderToString with strings doesn't create bindings.
      We really need to test Seidr.register() logic directly or spy on Scope.
    */
  });
});
