import { describe, expect, it } from "vitest";
import type { Component } from "../types";
import { useScope } from "./index";
import { pop, push } from "./stack";

describe("Component Stack", () => {
  const createMockComponent = (id: string, parent: Component | null = null): Component => {
    const comp = {
      id,
      parent,
    };
    return comp as Component;
  };

  it("should throw when stack is empty", () => {
    expect(() => useScope()).toThrow();
  });

  it("should return current component after push", () => {
    const root = createMockComponent("root");
    push(root);
    expect(useScope()).toBe(root);
    pop();
    expect(() => useScope()).toThrow();
  });

  it("should handle nested components", () => {
    const root = createMockComponent("root");
    const child = createMockComponent("child", root);

    push(root);
    expect(useScope()).toBe(root);

    push(child);
    expect(useScope()).toBe(child);

    pop();
    expect(useScope()).toBe(root);

    pop();
    expect(() => useScope()).toThrow();
  });
});
