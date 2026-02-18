import { beforeEach, describe, expect, it } from "vitest";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { navigate } from "../navigate";
import { useLocation } from "./use-location";

describe("useLocation", () => {
  beforeEach(() => {
    getCurrentPath().value = "/";
    getCurrentParams().value = {};
    window.history.replaceState(null, "", "/");
  });

  it("should return current pathname", () => {
    const location = useLocation();
    expect(location.pathname).toBe("/");
  });

  it("should update when path changes via navigate", () => {
    const location = useLocation();
    navigate("/about");
    expect(location.pathname).toBe("/about");
  });

  it("should provide reactive params", () => {
    const location = useLocation();
    const keys = Object.keys(location.params).filter((k) => k !== "$type");
    expect(keys).toHaveLength(0);

    getCurrentParams().value = { id: "456" };
    expect(location.params["id"]).toBe("456");
  });

  it("should provide reactive query params", () => {
    const location = useLocation();
    // Simulate navigation with query.
    // We must update BOTH window history (for internal checks) AND Seidr signal (for Weave).
    // navigate() assumes browser env.
    navigate("/?key=value");

    const params = location.queryParams;
    expect(params["key"]).toBe("value");
  });

  it("should expose window location properties", () => {
    const location = useLocation();
    expect(location.hostname).toBe(window.location.hostname);
    expect(location.protocol).toBe(window.location.protocol);
  });
});
