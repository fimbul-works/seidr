import { describe, expect, it } from "vitest";
import { defineProp } from "./define-prop";

describe("defineProp", () => {
  it("should define a non-writable and non-configurable property", () => {
    const obj: any = {};
    defineProp(obj, "test", 42);

    expect(obj.test).toBe(42);

    // Should be non-writable (throws in strict mode)
    expect(() => {
      obj.test = 100;
    }).toThrow();
    expect(obj.test).toBe(42);

    // Should be non-configurable
    expect(() => {
      Object.defineProperty(obj, "test", { value: 100 });
    }).toThrow();
    
    // Should be enumerable (per implementation)
    const keys = Object.keys(obj);
    expect(keys).toContain("test");
  });
});
