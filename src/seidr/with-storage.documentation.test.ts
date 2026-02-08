import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $ } from "../element";
import { Seidr } from "./seidr";
import { withStorage } from "./with-storage";

// Use globalThis for better compatibility
declare global {
  var localStorage: Storage;
  var sessionStorage: Storage;
}

describe("withStorage - Documentation Examples", () => {
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
