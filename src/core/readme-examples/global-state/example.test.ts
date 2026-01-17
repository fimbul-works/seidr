import { describe, expect, it } from "vitest";
import { getSetState } from "../../state";

describe("Global State Management Example", () => {
  it("should demonstrate getSetState usage", () => {
    // 1. Create a global state accessor
    const userCount = getSetState<number>("readme-user-count");

    // 2. Initialize
    userCount(0);
    expect(userCount()).toBe(0);

    // 3. Update and get previous value
    const prev = userCount(userCount()! + 1);

    expect(prev).toBe(0); // Previous value
    expect(userCount()).toBe(1); // New value
  });
});
