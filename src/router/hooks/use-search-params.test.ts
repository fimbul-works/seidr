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

  it("should return query params", () => {
    // Ensuring signal is updated
    navigate("/?q=hello&sort=asc");
    const [params] = useSearchParams();

    expect(params.q).toBe("hello");
    expect(params.sort).toBe("asc");
  });

  it("should update query params", () => {
    navigate("/");
    const [params, setParam] = useSearchParams();
    expect(params.new).toBeUndefined();

    setParam("new", "value");

    expect(window.location.search).toContain("new=value");
    expect(getCurrentPath().value).toContain("?new=value");
    expect(params.new).toBe("value");
  });

  it("should handle multiple params", () => {
    navigate("/?a=1");
    const [params, setParam] = useSearchParams();

    setParam("b", "2");
    expect(window.location.search).toContain("a=1");
    expect(window.location.search).toContain("b=2");
  });
});
