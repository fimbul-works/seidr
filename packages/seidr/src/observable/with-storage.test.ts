import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DATA_KEY_STATE } from "../observable/constants.js";
import { clearHydrationContext, initHydrationContext } from "../ssr/hydrate/hydration-context.js";
import { clearHydrationData, initHydrationData, isHydrating } from "../ssr/hydrate/storage.js";
import type { HydrationData } from "../ssr/types.js";
import { enableSSRMode } from "../test-setup/index.js";
import { MemoryStorage } from "../test-setup/memory-storage.js";
import { createValue } from "./value.js";
import { withStorage } from "./with-storage.js";

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
    withStorage(STORAGE_KEY, s, { storage });

    expect(s()).toEqual(storedValue);
  });

  it("should keep initial value if storage is empty", () => {
    const initialValue = { foo: "initial" };
    const s = createValue(initialValue);
    withStorage(STORAGE_KEY, s, { storage });

    expect(s()).toEqual(initialValue);
  });

  it("should persist changes to storage", () => {
    const s = createValue({ count: 0 });
    withStorage(STORAGE_KEY, s, { storage });

    s({ count: 1 });

    // Seidr updates are usually scheduled, but withStorage observer is called
    // We might need to wait for a tick or use sync: true
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual({ count: 1 });
  });

  it("should handle invalid JSON in storage (read error)", () => {
    storage.setItem(STORAGE_KEY, "not-json");
    const s = createValue({ foo: "initial" });

    // Default behavior is to throw
    expect(() => withStorage(STORAGE_KEY, s, { storage })).toThrow(/Failed to read from storage/);
  });

  it("should use custom onError handler for read errors", () => {
    storage.setItem(STORAGE_KEY, "not-json");
    const s = createValue({ foo: "initial" });
    const onError = vi.fn();

    withStorage(STORAGE_KEY, s, { storage, onError });

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

    withStorage(STORAGE_KEY, s, { storage: faultyStorage });

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

    withStorage(STORAGE_KEY, s, { storage: faultyStorage, onError });

    s({ count: 1 });

    expect(onError).toHaveBeenCalledWith(expect.any(Error), "write");
  });

  it("should be a no-op on server", () => {
    const cleanup = enableSSRMode();
    try {
      const s = createValue({ foo: "initial" });
      const storageSpy = vi.spyOn(storage, "getItem");

      const result = withStorage(STORAGE_KEY, s, { storage });

      expect(result).toBe(s);
      expect(storageSpy).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  it("should have priority over hydration data when onHydrated is not provided", () => {
    // Simulate hydration data by manually setting the value after creation
    // In a real scenario, Seidr.register would hydrate it.
    const hydratedValue = { source: "hydration" };
    const s = createValue(hydratedValue);

    // Now simulate storage having different data
    const storedValue = { source: "storage" };
    storage.setItem(STORAGE_KEY, JSON.stringify(storedValue));

    // Applying withStorage should overwrite hydrated value
    withStorage(STORAGE_KEY, s, { storage });

    expect(s()).toEqual(storedValue);
  });

  describe("onHydrated callback", () => {
    afterEach(() => {
      clearHydrationData();
      clearHydrationContext();
    });

    it("should trigger onHydrated when isHydrating is true, value.hydrate is true, and onHydrated is provided", () => {
      const valueId = "hydrated-val-1";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: { title: "SSR Title", count: 10 } } },
        components: {},
      };
      initHydrationData(hydrationData);

      expect(isHydrating()).toBe(true);

      const s = createValue({ title: "Default Title", count: 0 }, { id: valueId });
      expect(s.hydrate).toBe(true);
      expect(s()).toEqual({ title: "SSR Title", count: 10 });

      const storedValue = { title: "Stored Title", count: 99 };
      storage.setItem(STORAGE_KEY, JSON.stringify(storedValue));

      const onHydrated = vi.fn();
      withStorage(STORAGE_KEY, s, { storage, onHydrated });

      expect(onHydrated).toHaveBeenCalledTimes(1);
      expect(onHydrated).toHaveBeenCalledWith(s, storedValue);
      // Ensure storage does not automatically override the hydrated value
      expect(s()).toEqual({ title: "SSR Title", count: 10 });
    });

    it("should allow onHydrated handler to respect hydrated value and ignore storage", () => {
      const valueId = "respect-ssr-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: "server-rendered" } },
        components: {},
      };
      initHydrationData(hydrationData);

      const s = createValue("initial", { id: valueId });
      storage.setItem(STORAGE_KEY, JSON.stringify("local-stored"));

      withStorage(STORAGE_KEY, s, {
        storage,
        onHydrated: (_value, _storageValue) => {
          // Explicitly decide to keep hydrated value (no-op)
        },
      });

      expect(s()).toBe("server-rendered");
    });

    it("should allow onHydrated handler to choose the storage value", () => {
      const valueId = "prefer-storage-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: "server-rendered" } },
        components: {},
      };
      initHydrationData(hydrationData);

      const s = createValue("initial", { id: valueId });
      storage.setItem(STORAGE_KEY, JSON.stringify("local-stored"));

      withStorage(STORAGE_KEY, s, {
        storage,
        onHydrated: (value, storageValue) => {
          // Explicitly decide to apply storage value
          value(storageValue);
        },
      });

      expect(s()).toBe("local-stored");
    });

    it("should allow onHydrated handler to implement a custom merge strategy", () => {
      const valueId = "merge-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: { theme: "dark", user: "alice" } } },
        components: {},
      };
      initHydrationData(hydrationData);

      interface Profile {
        theme: string;
        user: string;
        lastSeen?: string;
      }

      const s = createValue<Profile>({ theme: "light", user: "guest" }, { id: valueId });
      storage.setItem(STORAGE_KEY, JSON.stringify({ theme: "light", lastSeen: "2026-10-26" }));

      withStorage(STORAGE_KEY, s, {
        storage,
        onHydrated: (value, storageValue) => {
          // Merge: keep SSR user, but take storage preferences
          value({
            ...value(),
            lastSeen: (storageValue as Profile).lastSeen,
          });
        },
      });

      expect(s()).toEqual({
        theme: "dark",
        user: "alice",
        lastSeen: "2026-10-26",
      });
    });

    it("should override hydrated data with storage value if onHydrated is not provided", () => {
      const valueId = "no-callback-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: "server-rendered" } },
        components: {},
      };
      initHydrationData(hydrationData);

      const s = createValue("initial", { id: valueId });
      expect(s()).toBe("server-rendered");

      storage.setItem(STORAGE_KEY, JSON.stringify("from-storage"));

      // No onHydrated provided -> storage value overrides
      withStorage(STORAGE_KEY, s, { storage });

      expect(s()).toBe("from-storage");
    });

    it("should not call onHydrated and should override with storage value if value has hydrate === false", () => {
      const valueId = "non-hydrated-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: "server-rendered" } },
        components: {},
      };
      initHydrationData(hydrationData);

      const s = createValue("client-only", { id: valueId, hydrate: false });
      expect(s.hydrate).toBe(false);
      expect(s()).toBe("client-only"); // Did not hydrate

      storage.setItem(STORAGE_KEY, JSON.stringify("from-storage"));

      const onHydrated = vi.fn();
      withStorage(STORAGE_KEY, s, { storage, onHydrated });

      expect(onHydrated).not.toHaveBeenCalled();
      expect(s()).toBe("from-storage");
    });

    it("should not call onHydrated and should override with storage value when there is no hydration context (isHydrating is false)", () => {
      expect(isHydrating()).toBe(false);

      const s = createValue("initial");
      expect(s.hydrate).toBe(true);

      storage.setItem(STORAGE_KEY, JSON.stringify("from-storage"));

      const onHydrated = vi.fn();
      withStorage(STORAGE_KEY, s, { storage, onHydrated });

      expect(onHydrated).not.toHaveBeenCalled();
      expect(s()).toBe("from-storage");
    });

    it("should not call onHydrated if storage does not contain a value for the key", () => {
      const valueId = "empty-storage-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: "server-rendered" } },
        components: {},
      };
      initHydrationData(hydrationData);

      const s = createValue("initial", { id: valueId });
      expect(s()).toBe("server-rendered");

      const onHydrated = vi.fn();
      withStorage(STORAGE_KEY, s, { storage, onHydrated });

      expect(onHydrated).not.toHaveBeenCalled();
      expect(s()).toBe("server-rendered");
    });

    it("should trigger onHydrated when both hydration data and hydration context (DOM) exist", () => {
      const container = document.createElement("div");
      const valueId = "ctx-dom-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: { setting: "from-ssr" } } },
        components: { Root: [] },
      };
      initHydrationData(hydrationData);
      initHydrationContext(container);

      const s = createValue({ setting: "initial" }, { id: valueId });
      expect(s()).toEqual({ setting: "from-ssr" });

      const storedValue = { setting: "from-storage" };
      storage.setItem(STORAGE_KEY, JSON.stringify(storedValue));

      const onHydrated = vi.fn();
      withStorage(STORAGE_KEY, s, { storage, onHydrated });

      expect(onHydrated).toHaveBeenCalledTimes(1);
      expect(onHydrated).toHaveBeenCalledWith(s, storedValue);
      expect(s()).toEqual({ setting: "from-ssr" });
    });

    it("should persist subsequent value updates to storage even after onHydrated is resolved", () => {
      const valueId = "persist-after-val";
      const hydrationData: HydrationData = {
        ctxID: 0,
        data: { [DATA_KEY_STATE]: { [valueId]: "server-rendered" } },
        components: {},
      };
      initHydrationData(hydrationData);

      const s = createValue("initial", { id: valueId });
      storage.setItem(STORAGE_KEY, JSON.stringify("stored-value"));

      withStorage(STORAGE_KEY, s, {
        storage,
        onHydrated: (_value, _storageValue) => {
          // keep hydrated value
        },
      });

      expect(s()).toBe("server-rendered");

      // Now update the value
      s("new-runtime-value");
      expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toBe("new-runtime-value");
    });

    it("should not call onHydrated and should override with storage value if SEIDR_DISABLE_SSR is enabled", () => {
      const prevDisableSSR = process.env.SEIDR_DISABLE_SSR;
      process.env.SEIDR_DISABLE_SSR = "true";

      try {
        const valueId = "disable-ssr-val";
        const hydrationData: HydrationData = {
          ctxID: 0,
          data: { [DATA_KEY_STATE]: { [valueId]: "server-rendered" } },
          components: {},
        };
        initHydrationData(hydrationData);

        const s = createValue("initial", { id: valueId });
        storage.setItem(STORAGE_KEY, JSON.stringify("stored-value"));

        const onHydrated = vi.fn();
        withStorage(STORAGE_KEY, s, { storage, onHydrated });

        expect(onHydrated).not.toHaveBeenCalled();
        expect(s()).toBe("stored-value");
      } finally {
        if (prevDisableSSR !== undefined) {
          process.env.SEIDR_DISABLE_SSR = prevDisableSSR;
        } else {
          delete process.env.SEIDR_DISABLE_SSR;
        }
      }
    });
  });
});
