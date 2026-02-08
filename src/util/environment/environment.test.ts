import { describe, expect, it } from "vitest";
import { enableSSRMode } from "../../test-setup";
import { SeidrError } from "../../types";
import { inClient, inServer, isClient, isServer } from "./index";

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

  describe("isClient", () => {
    it("should return true in browser environment", () => {
      expect(isClient()).toBe(true);
    });

    it("should return false in SSR test mode", () => {
      const cleanup = enableSSRMode();
      try {
        expect(isClient()).toBe(false);
      } finally {
        cleanup();
      }
    });
  });

  describe("inClient", () => {
    it("should execute function in browser environment", () => {
      const result = inClient(() => "browser result");
      expect(result).toBe("browser result");
    });

    it("should not execute function in SSR mode", () => {
      const cleanup = enableSSRMode();
      try {
        const result = inClient(() => "should not execute");
        expect(result).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    it("should return undefined for non-function values in SSR mode", () => {
      const cleanup = enableSSRMode();
      try {
        const result = inClient(() => {
          throw new SeidrError("Should not execute");
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
        throw new SeidrError("Should not execute");
      });
      expect(result).toBeUndefined();
    });
  });
});
