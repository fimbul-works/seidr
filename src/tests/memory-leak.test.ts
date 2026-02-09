import { describe, expect, it, vi } from "vitest";
import { $div, $span, mount, Seidr, useScope } from "../index.browser";

describe("Memory Leak Benchmark", () => {
  it("should not leak observers when mounting/destroying 1000 times", () => {
    const state = new Seidr(0);
    const derived = state.as((v) => `Value: ${v}`);

    expect(state.observerCount()).toBe(1); // One from 'derived'
    expect(derived.observerCount()).toBe(0);

    const TestComponent = () => {
      const scope = useScope();

      // Add some internal tracking
      scope.track(() => {});

      return $div({}, [$span({ textContent: state }), $span({ textContent: derived })]);
    };

    for (let i = 0; i < 1000; i++) {
      const unmount = mount(TestComponent, document.createElement("div"));

      // During active mount:
      // state has 2 observers (derived + component binding)
      // derived has 1 observer (component binding)
      expect(state.observerCount()).toBe(2);
      expect(derived.observerCount()).toBe(1);

      unmount();

      // After unmount:
      // state should return to 1 observer (the 'derived' instance itself)
      // derived should return to 0
      expect(state.observerCount()).toBe(1);
      expect(derived.observerCount()).toBe(0);
    }
  });

  it("should clean up internal timers tracked by useScope", () => {
    vi.useFakeTimers();
    let cleanupCalled = 0;

    const TimerComponent = () => {
      const scope = useScope();
      const count = new Seidr(0);

      const interval = setInterval(() => count.value++, 1000);
      scope.track(() => {
        clearInterval(interval);
        cleanupCalled++;
      });

      return $div({ textContent: count });
    };

    for (let i = 0; i < 1000; i++) {
      const unmount = mount(TimerComponent, document.createElement("div"));
      unmount();
    }

    expect(cleanupCalled).toBe(1000);
    vi.useRealTimers();
  });
});
