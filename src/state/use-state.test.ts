import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { STORAGE_LOCAL, STORAGE_SESSION } from "../constants";
import { runWithRenderContext, setMockRenderContextForTests } from "../render-context/render-context.node";
import { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { storageConfig } from "./storage";
import { useState } from "./use-state";

// Mock binding to verify calls
const bindStorageMock = vi.fn();
vi.mock("./storage-middleware", () => ({
  bindStorage: (...args: any[]) => bindStorageMock(...args),
}));

// Mock component stack to silence warnings
vi.mock("../component/component-stack", () => ({
  getCurrentComponent: () => ({ id: 1, name: "TestComponent" }),
}));

describe("useState", () => {
  let cleanupEnv: CleanupFunction;

  beforeAll(() => {
    cleanupEnv = setMockRenderContextForTests();
  });

  afterAll(() => {
    cleanupEnv();
  });

  afterEach(() => {
    storageConfig.clear();
    bindStorageMock.mockClear();
    vi.clearAllMocks();
  });

  it("should return a singleton Seidr instance", () => {
    runWithRenderContext(async () => {
      const [state1] = useState<number>("count");
      const [state2] = useState<number>("count");
      expect(state1).toBeInstanceOf(Seidr);
      expect(state1).toBe(state2);
    });
  });

  it("should initialize with undefined if not set and no initial value", () => {
    runWithRenderContext(async () => {
      const [state] = useState<number>("new-key");
      expect(state.value).toBeUndefined();
    });
  });

  it("should use initial value if provided", () => {
    runWithRenderContext(async () => {
      const [state] = useState<string>("init-key", "hello");
      expect(state.value).toBe("hello");
    });
  });

  it("should persist to storage when options provided", () => {
    runWithRenderContext(async () => {
      const [state] = useState("storage-key", "initial", { storage: STORAGE_LOCAL });
      expect(bindStorageMock).toHaveBeenCalledWith(
        expect.anything(), // Symbol key
        state,
        STORAGE_LOCAL,
        undefined,
      );
    });
  });

  it("should pass error handler to storage binding", () => {
    runWithRenderContext(async () => {
      const onError = vi.fn();
      const [state] = useState("error-key", "initial", { storage: STORAGE_SESSION, onStorageError: onError });

      expect(bindStorageMock).toHaveBeenCalledWith(expect.anything(), state, STORAGE_SESSION, onError);
    });
  });

  it("should not re-bind if already bound", () => {
    runWithRenderContext(async () => {
      // Simulate existing binding in config
      const key = "bound-key";

      // First call
      useState(key, "val", { storage: STORAGE_LOCAL });

      const args = bindStorageMock.mock.calls[0];
      const symbolKey = args[0];

      storageConfig.set(symbolKey, [STORAGE_LOCAL, () => {}]);
      bindStorageMock.mockClear();

      // Second call
      useState(key, "val", { storage: STORAGE_LOCAL });

      expect(bindStorageMock).not.toHaveBeenCalled();
    });
  });

  it("should warn if binding to different storage type", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    runWithRenderContext(async () => {
      useState("conflict-key", "val", { storage: STORAGE_LOCAL });

      // Fake the binding
      const symbolKey = bindStorageMock.mock.calls[0][0];
      storageConfig.set(symbolKey, [STORAGE_LOCAL, () => {}]);

      // Call with different storage
      useState("conflict-key", "val", { storage: STORAGE_SESSION });
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("already bound to local"));
    warnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});
