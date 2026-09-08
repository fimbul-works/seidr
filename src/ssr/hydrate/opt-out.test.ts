import { beforeEach, describe, expect, it } from "vitest";
import { DATA_KEY_STATE } from "../../observable/constants.js";
import { createValue } from "../../observable/value.js";
import { enableSSRMode } from "../../test-setup/index.js";
import { renderToString } from "../render-to-string.js";

describe("Value Hydration Opt-out", () => {
  beforeEach(() => {
    enableSSRMode();
  });

  it("should not include opt-out Value instances in hydration data", async () => {
    // Component with one hydrated and one non-hydrated Value
    const TestComponent = () => {
      const hydrated = createValue("keep me");
      hydrated.watch(() => {}); // Force registration

      const transient = createValue("drop me", { hydrate: false });
      transient.watch(() => {}); // Attempt registration (should be ignored)

      return `<div>${hydrated()} ${transient()}</div>`;
    };

    const { hydrationData } = await renderToString(TestComponent);

    const values = Object.values(hydrationData.data[DATA_KEY_STATE]!);
    expect(values).toContain("keep me");
    expect(values).not.toContain("drop me");
  });
});
