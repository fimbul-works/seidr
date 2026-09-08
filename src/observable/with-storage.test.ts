import { beforeEach, describe, expect, it, vi } from "vitest";
import { enableSSRMode } from "../test-setup/index.js";
import { createValue } from "./value.js";
import { withStorage } from "./with-storage.js";

/**
 * Simple in-memory Storage mock
 */
class MemoryStorage implements Storage {
  private data: Record<string, string> = {};

  get length() {
    return Object.keys(this.data).length;
  }

  clear() {
    this.data = {};
  }

  getItem(key: string) {
    return this.data[key] || null;
  }

  key(index: number) {
    return Object.keys(this.data)[index] || null;
  }

  removeItem(key: string) {
    delete this.data[key];
  }

  setItem(key: string, value: string) {
    this.data[key] = value;
  }
}

describe("withStorage", () => {
  let storage: MemoryStorage;
  const STORAGE_KEY = "test-key";

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("should load initial value from storage if present", () => {
    const storedValue = { foo: "bar" };
    storage.setItem(STORAGE_KEY, JSON.stringify(storedValue));

    const s = createValue({ foo: "initial" });
    withStorage(STORAGE_KEY, s, storage);

    expect(s()).toEqual(storedValue);
  });

  it("should keep initial value if storage is empty", () => {
    const initialValue = { foo: "initial" };
    const s = createValue(initialValue);
    withStorage(STORAGE_KEY, s, storage);

    expect(s()).toEqual(initialValue);
  });

  it("should persist changes to storage", () => {
    const s = createValue({ count: 0 });
    withStorage(STORAGE_KEY, s, storage);

    s({ count: 1 });

    // Seidr updates are usually scheduled, but withStorage observer is called
    // We might need to wait for a tick or use sync: true
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual({ count: 1 });
  });

  it("should handle invalid JSON in storage (read error)", () => {
    storage.setItem(STORAGE_KEY, "not-json");
    const s = createValue({ foo: "initial" });

    // Default behavior is to throw
    expect(() => withStorage(STORAGE_KEY, s, storage)).toThrow(/Failed to read from storage/);
  });

  it("should use custom onError handler for read errors", () => {
    storage.setItem(STORAGE_KEY, "not-json");
    const s = createValue({ foo: "initial" });
    const onError = vi.fn();

    withStorage(STORAGE_KEY, s, storage, onError);

    expect(onError).toHaveBeenCalledWith(expect.any(Error), "read");
    expect(s()).toEqual({ foo: "initial" }); // Should keep initial value
  });

  it("should handle storage write errors", () => {
    const s = createValue({ count: 0 });
    const faultyStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error("Quota exceeded");
      }),
    } as any;

    withStorage(STORAGE_KEY, s, faultyStorage);

    expect(() => {
      s({ count: 1 });
    }).toThrow(/Failed to write to storage/);
  });

  it("should use custom onError handler for write errors", () => {
    const s = createValue({ count: 0 });
    const onError = vi.fn();
    const faultyStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new Error("Quota exceeded");
      }),
    } as any;

    withStorage(STORAGE_KEY, s, faultyStorage, onError);

    s({ count: 1 });

    expect(onError).toHaveBeenCalledWith(expect.any(Error), "write");
  });

  it("should be a no-op on server", () => {
    const cleanup = enableSSRMode();
    try {
      const s = createValue({ foo: "initial" });
      const storageSpy = vi.spyOn(storage, "getItem");

      const result = withStorage(STORAGE_KEY, s, storage);

      expect(result).toBe(s);
      expect(storageSpy).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  it("should have priority over hydration data", () => {
    // Simulate hydration data by manually setting the value after creation
    // In a real scenario, Seidr.register would hydrate it.
    const hydratedValue = { source: "hydration" };
    const s = createValue(hydratedValue);

    // Now simulate storage having different data
    const storedValue = { source: "storage" };
    storage.setItem(STORAGE_KEY, JSON.stringify(storedValue));

    // Applying withStorage should overwrite hydrated value
    withStorage(STORAGE_KEY, s, storage);

    expect(s()).toEqual(storedValue);
  });
});
