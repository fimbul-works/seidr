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

  it("should return current pathname snapshot", () => {
    const location = useLocation();
    expect(location.pathname).toBe("/");
  });

  it("should provide reactivity via explicit signals", () => {
    const location = useLocation();
    navigate("/about");
    expect(location.pathSignal.value).toBe("/about");

    // The snapshot itself is stale
    expect(location.pathname).toBe("/");

    // Re-calling hook gives new snapshot
    const newLocation = useLocation();
    expect(newLocation.pathname).toBe("/about");
  });

  it("should provide reactive params via signal", () => {
    const location = useLocation();
    expect(Object.keys(location.params)).toHaveLength(0);

    getCurrentParams().value = { id: "456" };
    expect(location.paramsSignal.value.id).toBe("456");
  });

  it("should expose window location properties", () => {
    const location = useLocation();
    expect(location.hostname).toBe(window.location.hostname);
    expect(location.protocol).toBe(window.location.protocol);
  });
});
