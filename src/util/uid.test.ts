import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { uid } from "./uid.js";
import { uidTime } from "./uid-time.js";

describe("uid", () => {
  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(uid());
    }
    expect(ids.size).toBe(1000);
  });

  it("should generate time-sorted IDs", () => {
    const ids = Array.from({ length: 10 }, () => uid());
    const timestamps = ids.map((id) => id.split("-")[0]);
    for (let i = 1; i < timestamps.length; i++) {
      // console.log(ids[i], ids[i].length);
      expect(timestamps[i] >= timestamps[i - 1]).toBe(true);
    }
  });

  it("should be approximately 20 characters", () => {
    const id = uid();
    // console.log(id, id.length);
    expect(id.length).toBeGreaterThanOrEqual(18);
    expect(id.length).toBeLessThanOrEqual(22);
  });

  it("should contain hyphens as separators", () => {
    const id = uid();
    // console.log(id, id.length);
    expect(id).toMatch(/^[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+$/);
  });

  it("should be URL-safe", () => {
    const id = uid();
    // console.log(id, id.length);
    // Should only contain alphanumeric and hyphens
    expect(id).toMatch(/^[a-zA-Z0-9-]+$/);
    // Should not contain special characters that need encoding
    expect(id).not.toMatch(/[/+?=&]/);
  });

  it("should generate IDs with three components", () => {
    const id = uid();
    // console.log(id, id.length);
    const parts = id.split("-");
    expect(parts.length).toBe(3);
    expect(parts[0].length).toBeGreaterThan(0); // timestamp
    expect(parts[1].length).toBeGreaterThan(0); // pid or random
    expect(parts[2].length).toBe(8); // random
  });
});
