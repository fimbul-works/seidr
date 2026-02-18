import { beforeEach, describe, expect, it } from "vitest";
import { getCurrentParams } from "../get-current-params";
import { getCurrentPath } from "../get-current-path";
import { useRouter } from "./use-router";

describe("useRouter", () => {
  beforeEach(() => {
    getCurrentPath().value = "/";
    getCurrentParams().value = {};
    window.history.replaceState(null, "", "/");
  });

  it("should return location properties as static snapshot", () => {
    const router = useRouter();
    expect(router.pathname).toBe("/");
    expect(router.search).toBe("");
  });

  it("should return navigation functions", () => {
    const router = useRouter();
    expect(typeof router.navigate).toBe("function");
    expect(typeof router.redirect).toBe("function");
    expect(typeof router.history.back).toBe("function");
  });

  it("should push updates to signals but leave current snapshot static", () => {
    const router = useRouter();
    expect(router.pathname).toBe("/");

    router.navigate("/about");
    expect(router.pathSignal.value).toBe("/about");
    expect(router.pathname).toBe("/"); // Stale snapshot

    const nextRouter = useRouter();
    expect(nextRouter.pathname).toBe("/about");
  });

  it("should reflect params changes via signal", () => {
    const router = useRouter();
    getCurrentParams().value = { id: "123" };
    expect(router.paramsSignal.value.id).toBe("123");
  });

  it("should update query params", () => {
    const router = useRouter();
    router.navigate("/?q=hello");

    // Need new router for new snapshot
    const r2 = useRouter();
    expect(r2.queryParams.q).toBe("hello");

    r2.setQueryParam("q", "world");
    expect(window.location.search).toContain("q=world");
  });
});
