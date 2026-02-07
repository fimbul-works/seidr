import { describe, expect, it } from "vitest";
import { component } from "./component";
import { useScope } from "./use-scope";

describe("useScope", () => {
  it("should return the current component scope when called inside a component", () => {
    let capturedScope: any;
    component(() => {
      capturedScope = useScope();
      return null;
    })();
    expect(capturedScope).toBeDefined();
    expect(capturedScope.track).toBeTypeOf("function");
  });

  it("should throw error when called outside a component", () => {
    expect(() => useScope()).toThrow("useScope() must be called within a component");
  });
});
