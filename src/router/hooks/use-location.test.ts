import { beforeEach, describe, expect, it } from "vitest";
import { getCurrentPath } from "../get-current-path";
import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";

describe("useLocation", () => {
  beforeEach(() => {
    getCurrentPath().value = "/";
    window.history.replaceState(null, "", "/");
  });

  it("should return current path as a Seidr", () => {
    const location = useLocation();
    expect(location.value).toBe("/");
  });

  it("should be reactive when path changes", () => {
    const location = useLocation();
    const navigate = useNavigate();

    navigate("/about");
    expect(location.value).toBe("/about");
  });

  it("should be read-only (derived)", () => {
    const location = useLocation();
    expect(() => {
      location.value = "/forbidden";
    }).toThrow();
  });
});
