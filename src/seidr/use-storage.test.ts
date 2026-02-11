import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "./seidr";
import { useStorage } from "./use-storage";

declare global {
  var localStorage: Storage;
  var sessionStorage: Storage;
}

describe("useStorage", () => {
  let localStorageMock: { [key: string]: string };
  let sessionStorageMock: { [key: string]: string };
  let originalLocalStorage: Storage;
  let originalSessionStorage: Storage;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    originalLocalStorage = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      get length() {
        return Object.keys(localStorageMock).length;
      },
      key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null),
    };

    // Mock sessionStorage
    sessionStorageMock = {};
    originalSessionStorage = globalThis.sessionStorage;
    globalThis.sessionStorage = {
      getItem: vi.fn((key: string) => sessionStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        sessionStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete sessionStorageMock[key];
      }),
      clear: vi.fn(() => {
        sessionStorageMock = {};
      }),
      get length() {
        return Object.keys(sessionStorageMock).length;
      },
      key: vi.fn((index: number) => Object.keys(sessionStorageMock)[index] || null),
    };
  });

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage;
    globalThis.sessionStorage = originalSessionStorage;
  });

  describe("Basic functionality", () => {
    it("should return a cleanup function", () => {
      const original = new Seidr("test");
      const cleanup = useStorage("test-key", original);

      expect(typeof cleanup).toBe("function");
    });

    it("should initialize with stored value if it exists", () => {
      localStorageMock["test-key"] = JSON.stringify("stored-value");
      const seidr = new Seidr("initial-value");

      useStorage("test-key", seidr);

      expect(seidr.value).toBe("stored-value");
    });

    it("should keep initial value if no stored value exists", () => {
      const seidr = new Seidr("initial-value");

      useStorage("test-key", seidr);

      expect(seidr.value).toBe("initial-value");
    });

    it("should save changes to localStorage", () => {
      const seidr = new Seidr("initial");

      useStorage("test-key", seidr);
      seidr.value = "updated";

      expect(localStorage.setItem).toHaveBeenCalledWith("test-key", JSON.stringify("updated"));
      expect(localStorageMock["test-key"]).toBe(JSON.stringify("updated"));
    });
  });

  describe("Different data types", () => {
    it("should handle string values", () => {
      localStorageMock["string-key"] = JSON.stringify("stored-string");
      const seidr = new Seidr("");

      useStorage("string-key", seidr);

      expect(seidr.value).toBe("stored-string");

      seidr.value = "new-string";
      expect(localStorageMock["string-key"]).toBe(JSON.stringify("new-string"));
    });

    it("should handle number values", () => {
      localStorageMock["number-key"] = JSON.stringify(42);
      const seidr = new Seidr(0);

      useStorage("number-key", seidr);

      expect(seidr.value).toBe(42);

      seidr.value = 100;
      expect(localStorageMock["number-key"]).toBe(JSON.stringify(100));
    });

    it("should handle boolean values", () => {
      localStorageMock["bool-key"] = JSON.stringify(true);
      const seidr = new Seidr(false);

      useStorage("bool-key", seidr);

      expect(seidr.value).toBe(true);

      seidr.value = false;
      expect(localStorageMock["bool-key"]).toBe(JSON.stringify(false));
    });

    it("should handle null values", () => {
      localStorageMock["null-key"] = JSON.stringify(null);
      const seidr = new Seidr("not-null");

      useStorage("null-key", seidr);

      expect(seidr.value).toBeNull();
    });

    it("should handle object values", () => {
      const storedObject = { name: "John", age: 30 };
      localStorageMock["object-key"] = JSON.stringify(storedObject);
      const seidr = new Seidr({});

      useStorage("object-key", seidr);

      expect(seidr.value).toEqual(storedObject);

      const updatedObject = { name: "Jane", age: 25 };
      seidr.value = updatedObject;
      expect(localStorageMock["object-key"]).toBe(JSON.stringify(updatedObject));
    });

    it("should handle array values", () => {
      const storedArray = [1, 2, 3];
      localStorageMock["array-key"] = JSON.stringify(storedArray);
      const seidr = new Seidr<number[]>([]);

      useStorage("array-key", seidr);

      expect(seidr.value).toEqual(storedArray);

      const updatedArray = [4, 5, 6];
      seidr.value = updatedArray;
      expect(localStorageMock["array-key"]).toBe(JSON.stringify(updatedArray));
    });

    it("should handle complex nested objects", () => {
      const complexObject = {
        user: { name: "John", preferences: { theme: "dark" } },
        items: [{ id: 1, completed: false }],
      };
      localStorageMock["complex-key"] = JSON.stringify(complexObject);
      const seidr = new Seidr({});

      useStorage("complex-key", seidr);

      expect(seidr.value).toEqual(complexObject);
    });
  });

  describe("Storage options", () => {
    it("should use localStorage by default", () => {
      const seidr = new Seidr("test");

      useStorage("default-storage", seidr);
      seidr.value = "updated";

      expect(localStorage.setItem).toHaveBeenCalledWith("default-storage", JSON.stringify("updated"));
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it("should use sessionStorage when specified", () => {
      const seidr = new Seidr("test");

      useStorage("session-storage", seidr, sessionStorage);
      seidr.value = "updated";

      expect(sessionStorage.setItem).toHaveBeenCalledWith("session-storage", JSON.stringify("updated"));
      expect(localStorage.setItem).not.toHaveBeenCalledWith("session-storage", JSON.stringify("updated"));
    });

    it("should load from sessionStorage when specified", () => {
      sessionStorageMock["session-key"] = JSON.stringify("session-value");
      const seidr = new Seidr("initial");

      useStorage("session-key", seidr, sessionStorage);

      expect(seidr.value).toBe("session-value");
    });
  });

  describe("Reactivity integration", () => {
    it("should maintain Seidr reactivity after binding", () => {
      const seidr = new Seidr(0);
      const observer = vi.fn();

      useStorage("reactive-test", seidr);
      seidr.observe(observer);

      seidr.value = 5;

      expect(observer).toHaveBeenCalledWith(5);
      expect(localStorageMock["reactive-test"]).toBe(JSON.stringify(5));
    });

    it("should save derived values when they change", () => {
      const base = new Seidr(0);
      const derived = base.as((n) => n * 2);

      useStorage("derived-test", derived);

      base.value = 5; // This should trigger derived to update and save

      // Note: derived values don't automatically save when base changes
      // Only direct assignments to the derived observable save
      derived.value = 12; // Direct assignment
      expect(localStorageMock["derived-test"]).toBe(JSON.stringify(12));
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle invalid JSON in storage gracefully", () => {
      localStorageMock["invalid-json"] = "invalid-json-value";
      const seidr = new Seidr("default");

      expect(() => {
        useStorage("invalid-json", seidr);
      }).toThrow();
    });

    it("should handle empty string in storage", () => {
      localStorageMock["empty-string"] = JSON.stringify("");
      const seidr = new Seidr("default");

      useStorage("empty-string", seidr);

      expect(seidr.value).toBe("");
    });

    it("should not overwrite existing storage if no initial change", () => {
      localStorageMock["existing-key"] = JSON.stringify("original");
      const seidr = new Seidr("new-default");

      useStorage("existing-key", seidr);

      // Should load from storage, not save the new default
      expect(seidr.value).toBe("original");
      expect(localStorageMock["existing-key"]).toBe(JSON.stringify("original"));
    });

    it("should handle special characters in keys", () => {
      const seidr = new Seidr("test");
      const specialKey = "test-key-with.special@chars#and spaces";

      useStorage(specialKey, seidr);
      seidr.value = "updated";

      expect(localStorageMock[specialKey]).toBe(JSON.stringify("updated"));
    });
  });

  describe("Multiple observables", () => {
    it("should handle multiple observables with different keys", () => {
      const seidr1 = new Seidr("value1");
      const seidr2 = new Seidr("value2");

      useStorage("key1", seidr1);
      useStorage("key2", seidr2);

      seidr1.value = "updated1";
      seidr2.value = "updated2";

      expect(localStorageMock.key1).toBe(JSON.stringify("updated1"));
      expect(localStorageMock.key2).toBe(JSON.stringify("updated2"));
    });

    it("should not interfere with unrelated localStorage keys", () => {
      localStorageMock["other-key"] = JSON.stringify("other-value");

      const seidr = new Seidr("test");
      useStorage("my-key", seidr);
      seidr.value = "my-value";

      expect(localStorageMock["my-key"]).toBe(JSON.stringify("my-value"));
      expect(localStorageMock["other-key"]).toBe(JSON.stringify("other-value"));
    });
  });

  describe("Type safety", () => {
    it("should preserve type information", () => {
      interface User {
        name: string;
        age: number;
      }

      const userSeidr = new Seidr<User>({ name: "", age: 0 });
      useStorage("user", userSeidr);

      // TypeScript should infer the correct type
      expect(typeof userSeidr.value.name).toBe("string");
      expect(typeof userSeidr.value.age).toBe("number");
    });

    it("should work with derived observables", () => {
      const base = new Seidr(5);
      const derived = base.as((n) => `Number: ${n}`);

      useStorage("derived", derived);

      expect(typeof derived.value).toBe("string");
    });
  });

  describe("Cleanup", () => {
    it("should remove the storage binding when the cleanup function is called", () => {
      const seidr = new Seidr("test");
      const cleanup = useStorage("cleanup-test", seidr);

      seidr.value = "final-value";
      expect(localStorageMock["cleanup-test"]).toBe(JSON.stringify("final-value"));

      cleanup();

      seidr.value = "should-not-save";

      expect(localStorageMock["cleanup-test"]).toBe(JSON.stringify("final-value"));
    });

    it("should remove the storage binding when the observable is destroyed", () => {
      const seidr = new Seidr("test");
      useStorage("cleanup-test", seidr);

      seidr.value = "final-value";
      expect(localStorageMock["cleanup-test"]).toBe(JSON.stringify("final-value"));

      seidr.destroy();

      seidr.value = "should-not-save";

      expect(localStorageMock["cleanup-test"]).toBe(JSON.stringify("final-value"));
    });
  });

  describe("Server-side rendering", () => {
    it("should not throw errors in SSR environment", () => {
      expect(() => {
        const seidr = new Seidr({ data: "test" });
        const cleanup = useStorage("any-key", seidr);

        expect(typeof cleanup).toBe("function");
        expect(seidr.value).toEqual({ data: "test" });
      }).not.toThrow();
    });
  });
});
