import { describe, expect, it } from "vitest";
import { enableSSRMode } from "../test-setup";
import { isBrowser, isServer, inBrowser, inServer } from "./env";

describe("Environment detection and execution guards", () => {
  describe("isServer", () => {
    it("should return false in browser environment", () => {
      expect(isServer()).toBe(false);
    });

    it("should return true in SSR test mode", () => {
      const cleanup = enableSSRMode();
      try {
        expect(isServer()).toBe(true);
      } finally {
        cleanup();
      }
    });
  });

  describe("isBrowser", () => {
    it("should return true in browser environment", () => {
      expect(isBrowser()).toBe(true);
    });

    it("should return false in SSR test mode", () => {
      const cleanup = enableSSRMode();
      try {
        expect(isBrowser()).toBe(false);
      } finally {
        cleanup();
      }
    });
  });

  describe("inBrowser", () => {
    it("should execute function in browser environment", () => {
      const result = inBrowser(() => "browser result");
      expect(result).toBe("browser result");
    });

    it("should not execute function in SSR mode", () => {
      const cleanup = enableSSRMode();
      try {
        const result = inBrowser(() => "should not execute");
        expect(result).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    it("should return undefined for non-function values in SSR mode", () => {
      const cleanup = enableSSRMode();
      try {
        const result = inBrowser(() => {
          throw new Error("Should not execute");
        });
        expect(result).toBeUndefined();
      } finally {
        cleanup();
      }
    });
  });

  describe("inServer", () => {
    it("should not execute function in browser environment", () => {
      const result = inServer(() => "should not execute");
      expect(result).toBeUndefined();
    });

    it("should execute function in SSR mode", () => {
      const cleanup = enableSSRMode();
      try {
        const result = inServer(() => "server result");
        expect(result).toBe("server result");
      } finally {
        cleanup();
      }
    });

    it("should execute synchronous function in SSR mode", () => {
      const cleanup = enableSSRMode();
      try {
        const result = inServer(() => {
          return 42;
        });
        expect(result).toBe(42);
      } finally {
        cleanup();
      }
    });

    it("should return undefined in browser mode", () => {
      const result = inServer(() => {
        throw new Error("Should not execute");
      });
      expect(result).toBeUndefined();
    });
  });
});
