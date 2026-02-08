import { describe, expect, it } from "vitest";
import { createStateKey } from "./create-state-key";

describe("createStateKey - Documentation Examples", () => {
  it("should demonstrate type-safe state keys", () => {
    const USER_ID = createStateKey<number>("userId");
    const USER_NAME = createStateKey<string>("userName");

    expect(typeof USER_ID).toBe("symbol");
    expect(typeof USER_NAME).toBe("symbol");
  });
});
