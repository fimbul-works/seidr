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

  it("should return location as a Seidr", () => {
    const router = useRouter();
    expect(router.location.value).toBe("/");
  });

  it("should return navigate function", () => {
    const router = useRouter();
    expect(typeof router.navigate).toBe("function");
  });

  it("should return params as a Seidr", () => {
    const router = useRouter();
    expect(router.params.value).toEqual({});

    getCurrentParams().value = { id: "123" };
    expect(router.params.value.id).toBe("123");
  });

  it("should navigate and update location", () => {
    const router = useRouter();
    router.navigate("/about");
    expect(router.location.value).toBe("/about");
  });

  it("should manage search params", () => {
    const router = useRouter();
    router.navigate("/?q=hello");

    expect(router.searchParams.value.q).toBe("hello");

    router.setSearchParams("q", "world");
    expect(window.location.search).toContain("q=world");
    expect(router.searchParams.value.q).toBe("world");
  });
});
