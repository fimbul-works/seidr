import { describe, expect, it } from "vitest";
import { executeInContext, getCurrentComponent, pop, push } from "./component-stack";
import type { SeidrComponent } from "./types";

describe("Component Stack", () => {
  const createMockComponent = (id: string, parent: SeidrComponent | null = null): SeidrComponent => {
    return {
      id,
      scope: {
        parent,
      },
    } as unknown as SeidrComponent;
  };

  it("should return null when stack is empty", () => {
    expect(getCurrentComponent()).toBeNull();
  });

  it("should return current component after push", () => {
    const root = createMockComponent("root");
    push(root);
    expect(getCurrentComponent()).toBe(root);
    pop();
    expect(getCurrentComponent()).toBeNull();
  });

  it("should handle nested components", () => {
    const root = createMockComponent("root");
    const child = createMockComponent("child", root);

    push(root);
    expect(getCurrentComponent()).toBe(root);

    push(child);
    expect(getCurrentComponent()).toBe(child);

    pop();
    expect(getCurrentComponent()).toBe(root);

    pop();
    expect(getCurrentComponent()).toBeNull();
  });

  it("should execute function in context", () => {
    const root = createMockComponent("root");
    const child = createMockComponent("child", root);
    const isolated = createMockComponent("isolated");

    push(root);
    push(child);
    expect(getCurrentComponent()).toBe(child);

    const result = executeInContext(isolated, () => {
      expect(getCurrentComponent()).toBe(isolated);
      return "success";
    });

    expect(result).toBe("success");
    expect(getCurrentComponent()).toBe(child);
  });

  it("should restore context even if function throws", () => {
    const root = createMockComponent("root");
    push(root);

    executeInContext(createMockComponent("temp"), () => {
      throw new Error("fail");
    });

    expect(getCurrentComponent()).toBe(root);
    pop();
  });
});
