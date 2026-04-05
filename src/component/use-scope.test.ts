import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup/dual-mode";
import { setScope } from "./set-scope";
import { useScope } from "./use-scope";
import { component } from "./component";
import { SeidrError } from "../types";

describeDualMode("useScope", () => {
  it("should return the correctly set active component scope", () => {
    const Comp = component(() => null);
    const instance = Comp();
    
    setScope(instance);
    
    expect(useScope()).toBe(instance);
    
    setScope(null);
  });

  it("should throw a SeidrError when used outside of a component hierarchy", () => {
    setScope(null);
    
    expect(() => useScope()).toThrow(SeidrError);
    expect(() => useScope()).toThrow("useScope called outside of component hierarchy");
  });
});
