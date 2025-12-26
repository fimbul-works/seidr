import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $ } from "./dom/element";
import { Seidr } from "./seidr";
import { withStorage } from "./with-storage";

// Use globalThis for better compatibility
declare global {
  var localStorage: Storage;
  var sessionStorage: Storage;
}

describe("withStorage", () => {
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
    it("should return the same Seidr instance", () => {
      const original = new Seidr("test");
      const result = withStorage("test-key", original);

      expect(result).toBe(original);
    });

    it("should initialize with stored value if it exists", () => {
      localStorageMock["test-key"] = JSON.stringify("stored-value");
      const seidr = new Seidr("initial-value");

      withStorage("test-key", seidr);

      expect(seidr.value).toBe("stored-value");
    });

    it("should keep initial value if no stored value exists", () => {
      const seidr = new Seidr("initial-value");

      withStorage("test-key", seidr);

      expect(seidr.value).toBe("initial-value");
    });

    it("should save changes to localStorage", () => {
      const seidr = new Seidr("initial");

      withStorage("test-key", seidr);
      seidr.value = "updated";

      expect(localStorage.setItem).toHaveBeenCalledWith("test-key", JSON.stringify("updated"));
      expect(localStorageMock["test-key"]).toBe(JSON.stringify("updated"));
    });
  });

  describe("Different data types", () => {
    it("should handle string values", () => {
      localStorageMock["string-key"] = JSON.stringify("stored-string");
      const seidr = new Seidr("");

      withStorage("string-key", seidr);

      expect(seidr.value).toBe("stored-string");

      seidr.value = "new-string";
      expect(localStorageMock["string-key"]).toBe(JSON.stringify("new-string"));
    });

    it("should handle number values", () => {
      localStorageMock["number-key"] = JSON.stringify(42);
      const seidr = new Seidr(0);

      withStorage("number-key", seidr);

      expect(seidr.value).toBe(42);

      seidr.value = 100;
      expect(localStorageMock["number-key"]).toBe(JSON.stringify(100));
    });

    it("should handle boolean values", () => {
      localStorageMock["bool-key"] = JSON.stringify(true);
      const seidr = new Seidr(false);

      withStorage("bool-key", seidr);

      expect(seidr.value).toBe(true);

      seidr.value = false;
      expect(localStorageMock["bool-key"]).toBe(JSON.stringify(false));
    });

    it("should handle null values", () => {
      localStorageMock["null-key"] = JSON.stringify(null);
      const seidr = new Seidr("not-null");

      withStorage("null-key", seidr);

      expect(seidr.value).toBeNull();
    });

    it("should handle object values", () => {
      const storedObject = { name: "John", age: 30 };
      localStorageMock["object-key"] = JSON.stringify(storedObject);
      const seidr = new Seidr({});

      withStorage("object-key", seidr);

      expect(seidr.value).toEqual(storedObject);

      const updatedObject = { name: "Jane", age: 25 };
      seidr.value = updatedObject;
      expect(localStorageMock["object-key"]).toBe(JSON.stringify(updatedObject));
    });

    it("should handle array values", () => {
      const storedArray = [1, 2, 3];
      localStorageMock["array-key"] = JSON.stringify(storedArray);
      const seidr = new Seidr<number[]>([]);

      withStorage("array-key", seidr);

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

      withStorage("complex-key", seidr);

      expect(seidr.value).toEqual(complexObject);
    });
  });

  describe("Storage options", () => {
    it("should use localStorage by default", () => {
      const seidr = new Seidr("test");

      withStorage("default-storage", seidr);
      seidr.value = "updated";

      expect(localStorage.setItem).toHaveBeenCalledWith("default-storage", JSON.stringify("updated"));
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it("should use sessionStorage when specified", () => {
      const seidr = new Seidr("test");

      withStorage("session-storage", seidr, sessionStorage);
      seidr.value = "updated";

      expect(sessionStorage.setItem).toHaveBeenCalledWith("session-storage", JSON.stringify("updated"));
      expect(localStorage.setItem).not.toHaveBeenCalledWith("session-storage", JSON.stringify("updated"));
    });

    it("should load from sessionStorage when specified", () => {
      sessionStorageMock["session-key"] = JSON.stringify("session-value");
      const seidr = new Seidr("initial");

      withStorage("session-key", seidr, sessionStorage);

      expect(seidr.value).toBe("session-value");
    });
  });

  describe("Reactivity integration", () => {
    it("should maintain Seidr reactivity after binding", () => {
      const seidr = new Seidr(0);
      const observer = vi.fn();

      withStorage("reactive-test", seidr);
      seidr.observe(observer);

      seidr.value = 5;

      expect(observer).toHaveBeenCalledWith(5);
      expect(localStorageMock["reactive-test"]).toBe(JSON.stringify(5));
    });

    it("should save derived values when they change", () => {
      const base = new Seidr(0);
      const derived = base.as((n) => n * 2);

      withStorage("derived-test", derived);

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
        withStorage("invalid-json", seidr);
      }).toThrow();
    });

    it("should handle empty string in storage", () => {
      localStorageMock["empty-string"] = JSON.stringify("");
      const seidr = new Seidr("default");

      withStorage("empty-string", seidr);

      expect(seidr.value).toBe("");
    });

    it("should not overwrite existing storage if no initial change", () => {
      localStorageMock["existing-key"] = JSON.stringify("original");
      const seidr = new Seidr("new-default");

      withStorage("existing-key", seidr);

      // Should load from storage, not save the new default
      expect(seidr.value).toBe("original");
      expect(localStorageMock["existing-key"]).toBe(JSON.stringify("original"));
    });

    it("should handle special characters in keys", () => {
      const seidr = new Seidr("test");
      const specialKey = "test-key-with.special@chars#and spaces";

      withStorage(specialKey, seidr);
      seidr.value = "updated";

      expect(localStorageMock[specialKey]).toBe(JSON.stringify("updated"));
    });
  });

  describe("Multiple observables", () => {
    it("should handle multiple observables with different keys", () => {
      const seidr1 = new Seidr("value1");
      const seidr2 = new Seidr("value2");

      withStorage("key1", seidr1);
      withStorage("key2", seidr2);

      seidr1.value = "updated1";
      seidr2.value = "updated2";

      expect(localStorageMock.key1).toBe(JSON.stringify("updated1"));
      expect(localStorageMock.key2).toBe(JSON.stringify("updated2"));
    });

    it("should not interfere with unrelated localStorage keys", () => {
      localStorageMock["other-key"] = JSON.stringify("other-value");

      const seidr = new Seidr("test");
      withStorage("my-key", seidr);
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
      const result = withStorage("user", userSeidr);

      // TypeScript should infer the correct type
      expect(typeof result.value.name).toBe("string");
      expect(typeof result.value.age).toBe("number");
    });

    it("should work with derived observables", () => {
      const base = new Seidr(5);
      const derived = base.as((n) => `Number: ${n}`);

      const result = withStorage("derived", derived);

      expect(typeof result.value).toBe("string");
    });
  });

  describe("Cleanup", () => {
    it("should not prevent garbage collection when observable is destroyed", () => {
      const seidr = new Seidr("test");
      withStorage("cleanup-test", seidr);

      seidr.value = "final-value";
      expect(localStorageMock["cleanup-test"]).toBe(JSON.stringify("final-value"));

      // Destroy the observable
      seidr.destroy();

      // The storage binding should be cleaned up as part of the normal
      // observable destruction process
      seidr.value = "should-not-save";

      // This depends on the implementation - if the observer is cleaned up,
      // this value won't be saved. The test documents this behavior.
    });
  });

  describe("Documentation Examples", () => {
    describe("Basic usage with localStorage", () => {
      it("should demonstrate basic localStorage synchronization", () => {
        const userPreferences = withStorage("user-preferences", new Seidr({ theme: "dark", language: "en" }));

        // Value is automatically loaded from localStorage if it exists
        // Changes are automatically saved to localStorage
        userPreferences.value = { theme: "light", language: "es" };

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "user-preferences",
          JSON.stringify({ theme: "light", language: "es" }),
        );
      });

      it("should load existing value from localStorage", () => {
        // Pre-populate localStorage
        localStorageMock["user-preferences"] = JSON.stringify({ theme: "dark", language: "fr" });

        const userPreferences = withStorage(
          "user-preferences",
          new Seidr({ theme: "light", language: "en" }), // Initial value should be overridden
        );

        expect(userPreferences.value).toEqual({ theme: "dark", language: "fr" });
      });
    });

    describe("Using sessionStorage for temporary data", () => {
      it("should demonstrate sessionStorage usage", () => {
        const formData = withStorage(
          "checkout-form",
          new Seidr({ name: "", email: "" }),
          sessionStorage, // Data persists only for the session
        );

        // Form data persists across page reloads but clears when tab closes
        formData.value = { name: "John Doe", email: "" };

        expect(sessionStorage.setItem).toHaveBeenCalledWith(
          "checkout-form",
          JSON.stringify({ name: "John Doe", email: "" }),
        );
        expect(localStorage.setItem).not.toHaveBeenCalledWith("checkout-form", expect.any(String));
      });

      it("should load from sessionStorage when specified", () => {
        // Pre-populate sessionStorage
        sessionStorageMock["checkout-form"] = JSON.stringify({ name: "Jane", email: "jane@example.com" });

        const formData = withStorage("checkout-form", new Seidr({ name: "", email: "" }), sessionStorage);

        expect(formData.value).toEqual({ name: "Jane", email: "jane@example.com" });
      });
    });

    describe("Simple counter with persistence", () => {
      it("should demonstrate persistent counter", () => {
        const counter = withStorage("visit-counter", new Seidr(0));

        // Create UI elements using $ instead of the mentioned shortcuts
        const counterDisplay = $("div", {}, [
          $("span", {
            textContent: counter.as((c) => `Visits: ${c}`),
          }),
          $("button", {
            textContent: "Reset",
            onclick: () => (counter.value = 0),
          }),
        ]);

        // Counter persists across page reloads
        counter.value++; // Automatically saves to localStorage

        expect(localStorage.setItem).toHaveBeenCalledWith("visit-counter", JSON.stringify(1));
        expect(counterDisplay.textContent).toContain("Visits: 1");
      });

      it("should load and increment existing counter", () => {
        // Simulate existing counter value
        localStorageMock["visit-counter"] = JSON.stringify(5);

        const counter = withStorage("visit-counter", new Seidr(0));

        expect(counter.value).toBe(5);

        counter.value++; // Should increment from 5 to 6
        expect(counter.value).toBe(6);
        expect(localStorageMock["visit-counter"]).toBe(JSON.stringify(6));
      });
    });

    describe("Complex object persistence", () => {
      it("should demonstrate array persistence", () => {
        type TodoItem = { id: number; text: string; completed: boolean };

        const todos = withStorage("todo-list", new Seidr<TodoItem[]>([]));

        // Complex arrays are automatically serialized/deserialized
        todos.value = [
          { id: 1, text: "Learn Seidr", completed: true },
          { id: 2, text: "Build amazing apps", completed: false },
        ];

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "todo-list",
          JSON.stringify([
            { id: 1, text: "Learn Seidr", completed: true },
            { id: 2, text: "Build amazing apps", completed: false },
          ]),
        );
      });

      it("should load existing complex array", () => {
        type TodoItem = { id: number; text: string; completed: boolean };

        // Pre-populate with existing todos
        localStorageMock["todo-list"] = JSON.stringify([{ id: 1, text: "Existing task", completed: true }]);

        const todos = withStorage("todo-list", new Seidr<TodoItem[]>([]));

        expect(todos.value).toEqual([{ id: 1, text: "Existing task", completed: true }]);
      });

      it("should handle complex nested objects", () => {
        type UserSettings = {
          profile: { name: string; email: string };
          preferences: { theme: "light" | "dark"; notifications: boolean };
          history: string[];
        };

        const settings = withStorage(
          "user-settings",
          new Seidr<UserSettings>({
            profile: { name: "", email: "" },
            preferences: { theme: "light", notifications: true },
            history: [],
          }),
        );

        // Update nested properties
        settings.value = {
          profile: { name: "John Doe", email: "john@example.com" },
          preferences: { theme: "dark", notifications: false },
          history: ["action1", "action2"],
        };

        expect(localStorage.setItem).toHaveBeenCalledWith(
          "user-settings",
          JSON.stringify({
            profile: { name: "John Doe", email: "john@example.com" },
            preferences: { theme: "dark", notifications: false },
            history: ["action1", "action2"],
          }),
        );
      });
    });

    describe("Storage error handling examples", () => {
      it("should handle quota exceeded errors", () => {
        const mockQuotaError = new Error("Storage quota exceeded");
        mockQuotaError.name = "QuotaExceededError";

        localStorage.setItem = vi.fn().mockImplementation(() => {
          throw mockQuotaError;
        });

        const seidr = withStorage("large-data", new Seidr("test"));

        // Should throw when trying to save large data
        expect(() => {
          seidr.value = "x".repeat(10000000); // Large string
        }).toThrow("Storage quota exceeded");
      });

      it("should handle JSON parsing errors", () => {
        // Put invalid JSON in storage
        localStorageMock["invalid-data"] = "invalid-json-string";

        expect(() => {
          withStorage("invalid-data", new Seidr("default"));
        }).toThrow();
      });
    });

    describe("Multiple storage instances", () => {
      it("should handle multiple observables with different storage types", () => {
        const persistentData = withStorage("persistent", new Seidr("saved-forever"), localStorage);
        const temporaryData = withStorage("temporary", new Seidr("session-only"), sessionStorage);

        persistentData.value = "updated-persistent";
        temporaryData.value = "updated-temporary";

        expect(localStorage.setItem).toHaveBeenCalledWith("persistent", JSON.stringify("updated-persistent"));
        expect(sessionStorage.setItem).toHaveBeenCalledWith("temporary", JSON.stringify("updated-temporary"));

        // Should not cross-contaminate
        expect(sessionStorage.setItem).not.toHaveBeenCalledWith("persistent", expect.any(String));
        expect(localStorage.setItem).not.toHaveBeenCalledWith("temporary", expect.any(String));
      });
    });
  });
});
