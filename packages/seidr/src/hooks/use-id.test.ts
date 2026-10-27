import { beforeEach, describe, expect, it } from "vitest";
import { resetNextId } from "../test-setup/app-state.js";
import { useId } from "./use-id.js";

describe("useId", () => {
  beforeEach(() => resetNextId());

  it("returns deterministic IDs with the given prefix", () => {
    expect(useId("test")).toBe("test-1");
    expect(useId("test")).toBe("test-2");
    expect(useId("test")).toBe("test-3");
  });

  it("returns deterministic IDs without prefix when no prefix is provided", () => {
    expect(useId()).toBe("1");
    expect(useId()).toBe("2");
    expect(useId()).toBe("3");
  });

  it("returns deterministic IDs without prefix when empty prefix is provided", () => {
    expect(useId("")).toBe("1");
    expect(useId("")).toBe("2");
    expect(useId("")).toBe("3");
  });
});
