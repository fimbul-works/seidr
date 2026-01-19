import { describe, expect, it, vi } from "vitest";
import { runWithRenderContextStore } from "../../render-context.node";
import { component } from "../dom/component";
import { Seidr } from "../seidr";
import { setState } from "./set";
import { useState } from "./use-state";

describe("useState", () => {
  it("should return a singleton Seidr instance for a given key", () => {
    runWithRenderContextStore(() => {
      const [state1] = useState<number>("count");
      const [state2] = useState<number>("count");

      expect(state1).toBeInstanceOf(Seidr);
      expect(state1).toBe(state2); // Should be the exact same instance
    });
  });

  it("should initialize with undefined if not previously set", () => {
    runWithRenderContextStore(() => {
      const [state] = useState<number>("new-key");
      expect(state.value).toBeUndefined();
    });
  });

  it("should pick up existing plain value and wrap it", () => {
    runWithRenderContextStore(() => {
      // Simulate existing plain value
      const [state] = useState<string>("pre-existing");
      state.value = "hello";

      const [stateAgain] = useState<string>("pre-existing");
      expect(stateAgain.value).toBe("hello");
      expect(stateAgain).toBe(state);
    });
  });

  it("should synchronize between multiple uses via setter", () => {
    runWithRenderContextStore(() => {
      const [state1, setState1] = useState<number>("shared");
      const [state2] = useState<number>("shared");

      setState1(10);
      expect(state2.value).toBe(10);
    });
  });

  it("should handle Seidr instances passed to setter", () => {
    runWithRenderContextStore(() => {
      const [state, setStateFunc] = useState<number>("test");
      const otherSeidr = new Seidr(42);

      setStateFunc(otherSeidr);
      expect(state.value).toBe(42);
    });
  });

  it("should warn when called outside component hierarchy", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    runWithRenderContextStore(() => {
      useState("outside");
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Calling useState outside of component hierarchy"));
    warnSpy.mockRestore();
  });

  it("should not warn when called inside component hierarchy", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    runWithRenderContextStore(() => {
      const MyComp = component(() => {
        useState("inside");
        return "div";
      });
      MyComp();
    });

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("should interact correctly with plain setState", () => {
    runWithRenderContextStore(() => {
      const [state] = useState<number>("interact");
      state.value = 10;

      setState("interact", 20);
      expect(state.value).toBe(20); // useState's singleton should have been updated
    });
  });
});
