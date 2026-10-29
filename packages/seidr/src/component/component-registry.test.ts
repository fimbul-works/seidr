import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { describeDualMode, enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { clearComponentRegistry, getMarkerRegistry } from "./component-registry";

describeDualMode("Component Registry", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
  });

  afterEach(() => {
    restore();
  });

  describe("clearComponentRegistry", () => {
    it("should remove all markers from DOM", () => {
      const start = document.createComment("start");
      const end = document.createComment("end");
      const container = document.createElement("div");
      container.appendChild(start);
      container.appendChild(end);

      getMarkerRegistry().set("test", [start, end]);

      expect(container.contains(start)).toBe(true);

      clearComponentRegistry();

      expect(container.contains(start)).toBe(false);
      expect(container.contains(end)).toBe(false);
      expect(getMarkerRegistry().size).toBe(0);
    });
  });
});
