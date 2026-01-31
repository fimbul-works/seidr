import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { uid } from "./uid";
import { uidTime } from "./uid-time";

describe("uidTime", () => {
  // Store original Date.now to restore after tests
  let originalDateNow: () => number;

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
    // Create a UID with known timestamp (Date.now() = 1234567890000)
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
    // Test with different timestamp values
    const timestamps = [0, 1000, 1000000, Date.now()];

    timestamps.forEach((ts) => {
      Date.now = () => ts;
      const id = uid();
      const createdAt = uidTime(id);

      expect(createdAt).toBe(ts);
    });
  });
});

// Documentation Examples Tests
describe("uidTime - Documentation Examples", () => {
  it("should work with basic usage example", () => {
    const id = uid();
    const createdAt = uidTime(id);

    expect(typeof createdAt).toBe("number");
  });

  it("should support sorting by creation time", () => {
    type Item = { id: string; text: string };

    const items: Item[] = [
      { id: uid(), text: "Second" },
      { id: uid(), text: "Third" },
      { id: uid(), text: "First" },
    ];

    // Sort by creation time (ascending)
    items.sort((a, b) => uidTime(a.id) - uidTime(b.id));

    // Verify items are sorted
    for (let i = 1; i < items.length; i++) {
      const timeA = uidTime(items[i - 1].id);
      const timeB = uidTime(items[i].id);
      expect(timeB).toBeGreaterThanOrEqual(timeA);
    }
  });

  it("should enable filtering by time range", () => {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    type Item = { id: string; text: string };

    const items: Item[] = [
      { id: uid(), text: "Recent" },
      { id: uid(), text: "Old" },
    ];

    // Filter items created in the last hour
    const recentItems = items.filter((item) => uidTime(item.id) >= oneHourAgo);

    expect(recentItems.length).toBe(2);
  });

  it("should allow comparison of item ages", () => {
    const items = [
      { id: uid(), name: "Alice" },
      { id: uid(), name: "Bob" },
    ];

    // Get the age of each item in milliseconds
    const ages = items.map((item) => Date.now() - uidTime(item.id));

    expect(ages[0]).toBeGreaterThanOrEqual(0);
    expect(ages[1]).toBeGreaterThanOrEqual(0);

    // Second item should be newer (younger) or same age (created in same ms)
    expect(ages[1]).toBeLessThanOrEqual(ages[0]);
  });
});
