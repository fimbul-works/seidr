import { describe, expect, it } from "vitest";
import type { SeidrComponent } from "./component";
import { createScope } from "./component-scope";
import { $ } from "./element";

describe("createScope", () => {
  it("should create a scope with track, child, and destroy methods", () => {
    const scope = createScope();

    expect(scope).toHaveProperty("track");
    expect(scope).toHaveProperty("child");
    expect(scope).toHaveProperty("destroy");
    expect(typeof scope.track).toBe("function");
    expect(typeof scope.child).toBe("function");
    expect(typeof scope.destroy).toBe("function");
  });

  it("should track cleanup functions and call them on destroy", () => {
    const scope = createScope();
    let cleanupCalled = false;

    scope.track(() => {
      cleanupCalled = true;
    });

    expect(cleanupCalled).toBe(false);

    scope.destroy();

    expect(cleanupCalled).toBe(true);
  });

  it("should track multiple cleanup functions", () => {
    const scope = createScope();
    let cleanup1Called = false;
    let cleanup2Called = false;

    scope.track(() => {
      cleanup1Called = true;
    });
    scope.track(() => {
      cleanup2Called = true;
    });

    scope.destroy();

    expect(cleanup1Called).toBe(true);
    expect(cleanup2Called).toBe(true);
  });

  it("should not execute cleanup functions twice on multiple destroy calls", () => {
    const scope = createScope();
    let cleanupCount = 0;

    scope.track(() => {
      cleanupCount++;
    });

    scope.destroy();
    scope.destroy();

    expect(cleanupCount).toBe(1);
  });

  it("should execute cleanup immediately if tracked after destroy", () => {
    const scope = createScope();
    let cleanupCalled = false;

    scope.destroy();

    scope.track(() => {
      cleanupCalled = true;
    });

    expect(cleanupCalled).toBe(true);
  });

  it("should track child components and destroy them when parent is destroyed", () => {
    const scope = createScope();
    let childDestroyed = false;

    const mockChild: SeidrComponent = {
      element: $("div"),
      destroy: () => {
        childDestroyed = true;
      },
    };

    scope.child(mockChild);
    scope.destroy();

    expect(childDestroyed).toBe(true);
  });
});
