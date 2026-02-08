import { beforeEach, expect, it } from "vitest";
import { describeDualMode } from "../test-setup";
import { getCurrentPath } from "./get-current-path";
import { initRouter } from "./init-router";

describeDualMode("getCurrentPath", () => {
  beforeEach(() => {
    initRouter("/");
  });

  it("should return a Seidr instance with current path", () => {
    const path = getCurrentPath();
    expect(path.value).toBe("/");
  });

  it("should return the same instance on multiple calls", () => {
    const path1 = getCurrentPath();
    const path2 = getCurrentPath();
    expect(path1).toBe(path2);
  });
});
