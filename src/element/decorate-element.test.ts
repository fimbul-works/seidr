import { expect, it } from "vitest";
import { SEIDR_CLEANUP } from "../constants";
import { describeDualMode } from "../test-setup";
import { decorateElement } from "./decorate-element";

describeDualMode("decorateElement", ({ getDocument }) => {
  it("should handle cleanup", () => {
    const factory = getDocument();
    const el = factory.createElement("div");
    let cleaned = false;
    const decorated = decorateElement(el, [
      () => {
        cleaned = true;
      },
    ]);

    decorated[SEIDR_CLEANUP]();
    expect(cleaned).toBe(true);
  });
});
