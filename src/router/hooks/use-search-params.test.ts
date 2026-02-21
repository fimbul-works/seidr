import { beforeEach, describe, expect, it } from "vitest";
import { getCurrentPath } from "../get-current-path";
import { useNavigate } from "./use-navigate";
import { useSearchParams } from "./use-search-params";

describe("useSearchParams", () => {
  beforeEach(() => {
    getCurrentPath().value = "/";
    window.history.replaceState(null, "", "/");
  });

  it("should return reactive query params", () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    navigate("/?q=hello");
    expect(params.value.q).toBe("hello");
  });

  it("should update query params and reflect in Seidr", () => {
    const [params, setParam] = useSearchParams();
    expect(params.value.new).toBeUndefined();

    setParam("new", "value");

    expect(window.location.search).toContain("new=value");
    expect(getCurrentPath().value).toContain("?new=value");

    // The params Seidr should be updated automatically
    expect(params.value.new).toBe("value");
  });
});
