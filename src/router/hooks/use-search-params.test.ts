import { beforeEach, describe, expect, it } from "vitest";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { navigate } from "../navigate";
import { useSearchParams } from "./use-search-params";

describe("useSearchParams", () => {
  beforeEach(() => {
    getCurrentPath().value = "/";
    getCurrentParams().value = {};
    window.history.replaceState(null, "", "/");
  });

  it("should return query params snapshot", () => {
    navigate("/?q=hello");
    const [params] = useSearchParams();
    expect(params.q).toBe("hello");
  });

  it("should update query params and require new hook call for new snapshot", () => {
    navigate("/");
    const [params, setParam] = useSearchParams();
    expect(params.new).toBeUndefined();

    setParam("new", "value");

    expect(window.location.search).toContain("new=value");
    expect(getCurrentPath().value).toContain("?new=value");

    // The old params object is a stale snapshot
    expect(params.new).toBeUndefined();

    // New hook call gets new snapshot
    const [newParams] = useSearchParams();
    expect(newParams.new).toBe("value");
  });
});
