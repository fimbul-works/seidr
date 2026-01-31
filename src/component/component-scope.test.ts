import { describe, expect, it, vi } from "vitest";
import { createScope } from "./component-scope";
import type { SeidrComponent } from "./types";

describe("ComponentScope", () => {
  it("should track and execute cleanups", () => {
    const scope = createScope();
    const cleanup = vi.fn();

    scope.track(cleanup);
    expect(cleanup).not.toHaveBeenCalled();

    scope.destroy();
    expect(cleanup).toHaveBeenCalled();
  });

  it("should expose isDestroyed status", () => {
    const scope = createScope();
    expect(scope.isDestroyed).toBe(false);

    scope.destroy();
    expect(scope.isDestroyed).toBe(true);
  });

  it("should execute cleanups immediately if already destroyed", () => {
    const scope = createScope();
    scope.destroy();

    const cleanup = vi.fn();
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    scope.track(cleanup);

    expect(cleanup).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("Tracking cleanup on already destroyed scope");

    consoleSpy.mockRestore();
  });

  it("should track child components", () => {
    const scope = createScope();
    const childComponent = { destroy: vi.fn() } as unknown as SeidrComponent;

    scope.child(childComponent);
    expect(childComponent.destroy).not.toHaveBeenCalled();

    scope.destroy();
    expect(childComponent.destroy).toHaveBeenCalled();
  });
});
