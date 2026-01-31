import { describe, expect, it } from "vitest";
import { useState } from "../state";

describe("Global State Management Example", () => {
  it("should demonstrate useState usage", () => {
    // 1. Initialize state with the useState hook
    const [userCount, setUserCount] = useState<number>("readme-user-count");

    // 2. Initial state (undefined by default if not set elsewhere)
    setUserCount(0);
    expect(userCount.value).toBe(0);

    // 3. Update state
    setUserCount(userCount.value! + 1);

    expect(userCount.value).toBe(1); // New value
  });
});
