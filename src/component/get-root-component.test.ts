import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup/dual-mode";
import { setScope } from "./set-scope";
import { getRootComponent } from "./get-root-component";
import { component } from "./component";
import type { Component } from "./types";

describeDualMode("getRootComponent", () => {
  it("should return null if no active component scope is set", () => {
    setScope(null);
    expect(getRootComponent()).toBeNull();
  });

  it("should return the component itself if it's the root (no parent)", () => {
    let capturedRoot: Component | null = null;
    const Root = component(() => {
      capturedRoot = getRootComponent();
      return null;
    }, "Root");

    const rootInstance = Root();
    expect(capturedRoot).toBe(rootInstance);
    expect(getRootComponent()).toBeNull(); // Scope is cleared after render

    // Manual verify with setScope
    setScope(rootInstance);
    expect(getRootComponent()).toBe(rootInstance);
    setScope(null);
  });

  it("should traverse the parent hierarchy to find the root component", () => {
    let capturedRoot: Component | null = null;
    let rootInstance: Component | null = null;

    const GrandChild = component(() => {
      capturedRoot = getRootComponent();
      return null;
    }, "GrandChild");

    const Child = component(() => GrandChild(), "Child");

    const Root = component(() => {
      rootInstance = Child();
      return null;
    }, "Root");

    const actualRootInstance = Root();

    expect(capturedRoot).toBe(actualRootInstance);
    expect((capturedRoot as any)?.id).toContain("Root");
  });
});
