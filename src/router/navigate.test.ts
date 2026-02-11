import { beforeEach, expect, it, vi } from "vitest";
import { describeDualMode } from "../test-setup";
import { getCurrentPath } from "./get-current-path";
import { navigate } from "./navigate";

describeDualMode("navigate", ({ mode }) => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      history: {
        pushState: vi.fn(),
      },
    });
  });

  it("should update currentPath value", () => {
    navigate("/about");
    expect(getCurrentPath().value).toBe("/about");
  });

  it("should strip query params and hashes", () => {
    navigate("/about?foo=bar#baz");
    expect(getCurrentPath().value).toBe("/about");
  });

  if (mode !== "SSR") {
    it("should call window.history.pushState", () => {
      navigate("/contact");
      expect(window.history.pushState).toHaveBeenCalledWith({}, "", "/contact");
    });
  }
});
