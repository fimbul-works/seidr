import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_LOCAL, STORAGE_SESSION } from "../constants";
import { Seidr } from "../seidr/seidr";
import { storageConfig } from "./storage";
import { bindStorage, getStorageInstance, readFromStorage, writeToStorage } from "./storage-middleware";

declare global {
  var localStorage: Storage;
  var sessionStorage: Storage;
}

describe("storage-middleware", () => {
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

    storageConfig.clear();
  });

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage;
    globalThis.sessionStorage = originalSessionStorage;
    storageConfig.clear();
  });

  describe("getStorageInstance", () => {
    it("should return localStorage when specified", () => {
      expect(getStorageInstance(STORAGE_LOCAL)).toBe(globalThis.localStorage);
    });

    it("should return sessionStorage when specified", () => {
      expect(getStorageInstance(STORAGE_SESSION)).toBe(globalThis.sessionStorage);
    });
  });

  describe("readFromStorage", () => {
    it("should read value from storage and update observable", () => {
      localStorageMock["test-key"] = JSON.stringify("stored-value");
      const observable = new Seidr("initial");
      readFromStorage("test-key", observable, globalThis.localStorage);
      expect(observable.value).toBe("stored-value");
    });

    it("should handle invalid JSON gracefully", () => {
      localStorageMock["invalid-key"] = "invalid-json";
      const observable = new Seidr("initial");

      // Should throw by default if no onError provided
      expect(() => {
        readFromStorage("invalid-key", observable, globalThis.localStorage);
      }).toThrow();
    });

    it("should call onError when invalid JSON", () => {
      localStorageMock["invalid-key"] = "invalid-json";
      const observable = new Seidr("initial");
      const onError = vi.fn();

      readFromStorage("invalid-key", observable, globalThis.localStorage, onError);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), "read");
    });
  });

  describe("writeToStorage", () => {
    it("should write value to storage", () => {
      const observable = new Seidr("test");
      writeToStorage("test-key", "new-value", globalThis.localStorage, observable);
      expect(localStorageMock["test-key"]).toBe(JSON.stringify("new-value"));
    });

    it("should call onError when write fails", () => {
      const observable = new Seidr("test");
      const onError = vi.fn();

      // Mock setItem to throw
      globalThis.localStorage.setItem = vi.fn(() => {
        throw new Error("QuotaExceeded");
      });

      writeToStorage("test-key", "value", globalThis.localStorage, observable, onError);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), "write");
    });
  });

  describe("bindStorage", () => {
    it("should bind observable to storage and return cleanup", () => {
      const observable = new Seidr("initial");
      const cleanup = bindStorage("bind-key", observable, STORAGE_LOCAL);

      // Check initial read (empty)
      expect(observable.value).toBe("initial");

      // Check write on change
      observable.value = "updated";
      expect(localStorageMock["bind-key"]).toBe(JSON.stringify("updated"));

      // Check cleanup
      cleanup();
      observable.value = "final";
      expect(localStorageMock["bind-key"]).toBe(JSON.stringify("updated")); // Stale value
    });

    it("should load initial value on bind", () => {
      localStorageMock["bind-key"] = JSON.stringify("existing");
      const observable = new Seidr("initial");
      bindStorage("bind-key", observable, STORAGE_LOCAL);
      expect(observable.value).toBe("existing");
    });
  });
});
