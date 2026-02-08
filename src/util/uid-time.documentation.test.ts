import { describe, expect, it } from "vitest";
import { uid } from "./uid";
import { uidTime } from "./uid-time";

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
