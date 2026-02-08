import { beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { NO_HYDRATE } from "../../seidr/constants";
import { enableSSRMode } from "../../test-setup";
import { renderToString } from "../render-to-string";

describe("Seidr Hydration Opt-out", () => {
  beforeEach(() => {
    enableSSRMode();
  });

  it("should not include opt-out Seidr instances in hydration data", async () => {
    // Component with one hydrated and one non-hydrated Seidr
    const TestComponent = () => {
      const hydrated = new Seidr("keep me");
      hydrated.observe(() => {}); // Force registration

      const transient = new Seidr("drop me", NO_HYDRATE);
      transient.observe(() => {}); // Attempt registration (should be ignored)

      return `<div>${hydrated.value} ${transient.value}</div>`;
    };

    const { hydrationData } = await renderToString(TestComponent);
    const values = Object.values(hydrationData.observables);
    expect(values).toContain("keep me");
    expect(values).not.toContain("drop me");
  });
});
