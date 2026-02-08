import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { uid } from "./uid";
import { uidTime } from "./uid-time";

describe("uidTime", () => {
  // Store original Date.now to restore after tests
  let originalDateNow: typeof Date.now;

  beforeEach(() => {
    originalDateNow = Date.now;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it("should extract creation time from a UID", () => {
    const now = Date.now();
    const id = uid();
    const createdAt = uidTime(id);

    // Extracted time should be within 1 second of current time
    expect(createdAt).toBeGreaterThanOrEqual(now);
    expect(createdAt).toBeLessThanOrEqual(now + 1000);
  });

  it("should extract timestamp from first component", () => {
    const testTimestamp = 1234567890000;
    Date.now = () => testTimestamp;

    const id = uid();
    const createdAt = uidTime(id);

    expect(createdAt).toBe(testTimestamp);
  });

  it("should be consistent for the same UID", () => {
    const id = uid();
    const time1 = uidTime(id);
    const time2 = uidTime(id);

    expect(time1).toBe(time2);
  });

  it("should handle different UIDs correctly", () => {
    let timestamp = 1000;
    Date.now = () => timestamp++;
    const ids = Array.from({ length: 10 }, () => uid());
    const times = ids.map((id) => uidTime(id));

    // Times should be non-decreasing (since UIDs are time-sorted)
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
    }
  });

  it("should throw error for invalid base-62 characters", () => {
    const invalidId = "invalid@timestamp-abc-12345678";

    expect(() => uidTime(invalidId)).toThrow("Invalid base-62 character");
  });

  it("should handle UIDs with different timestamp lengths", () => {
    const timestamps = [0, 1000, 1000000, Date.now()];

    timestamps.forEach((ts) => {
      Date.now = () => ts;
      const id = uid();
      const createdAt = uidTime(id);

      expect(createdAt).toBe(ts);
    });
  });
});
