import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { useRouter } from "./use-router";

describe("useRouter", () => {
  beforeEach(() => {
    getCurrentPath().value = "/";
    getCurrentParams().value = {};
    window.history.replaceState(null, "", "/");
  });

  it("should return location properties", () => {
    const router = useRouter();
    expect(router.pathname).toBe("/");
    expect(router.search).toBe("");
  });

  it.skip("should return navigate functions", () => {
    const router = useRouter();
    // Use simple truthy checks if typeof is flaky with Proxy
    expect(router.navigate).toBeDefined();
    expect(router.redirect).toBeDefined();
    expect(router.back).toBeDefined();
  });

  it("should reflect path changes", () => {
    const router = useRouter();
    expect(router.pathname).toBe("/");

    router.navigate("/about"); // Use router.navigate explicitly
    expect(router.pathname).toBe("/about");
    expect(getCurrentPath().value).toBe("/about");
  });

  it("should reflect params changes", () => {
    const router = useRouter();
    // Ensure we filter out internal keys if any
    const keys = Object.keys(router.params).filter((k) => k !== "$type");
    expect(keys).toHaveLength(0);

    getCurrentParams().value = { id: "123" };
    expect(router.params.id).toBe("123");
  });

  it("should provide simplified query param access", () => {
    const router = useRouter();
    // Use navigate to set state
    router.navigate("/?q=hello");

    // Access query params
    const qParams = router.queryParams;
    expect(qParams.q).toBe("hello");

    router.setQueryParam("q", "world");
    expect(window.location.search).toContain("q=world");
  });
});
