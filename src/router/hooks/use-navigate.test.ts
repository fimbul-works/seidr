import { beforeEach, expect, it, vi } from "vitest";
import { describeDualMode, enableClientMode } from "../../test-setup";
import { getCurrentPath } from "../get-current-path";
import { useNavigate } from "./use-navigate";

describeDualMode("useNavigate", ({ mode }) => {
  beforeEach(() => {
    enableClientMode();
    vi.stubGlobal("window", {
      location: {
        pathname: "/",
        search: "",
        hash: "",
        href: "http://localhost/",
      },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        go: vi.fn(),
      },
    });
  });

  it("should update currentPath value", () => {
    const navigate = useNavigate();
    navigate("/about");
    expect(getCurrentPath().value).toBe("/about");
  });

  it("should preserve query params and hashes", () => {
    const navigate = useNavigate();
    navigate("/about?foo=bar#baz");
    expect(getCurrentPath().value).toBe("/about?foo=bar#baz");
  });

  if (mode !== "SSR") {
    it("should call window.history.pushState", () => {
      const navigate = useNavigate();
      navigate("/contact");
      expect(window.history.pushState).toHaveBeenCalledWith({}, "", "/contact");
    });

    it("should call window.history.go when passing a number", () => {
      const navigate = useNavigate();
      navigate(-1);
      expect(window.history.go).toHaveBeenCalledWith(-1);
    });
  }
});
