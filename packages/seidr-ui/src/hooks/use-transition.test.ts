import { createValue } from "@fimbul-works/seidr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTransition } from "./use-transition.js";

const testTransition = {
  in: { opacity: 1, transform: "scale(1)" },
  out: { opacity: 0, transform: "scale(0.9)" },
  common: { "transform-origin": "top" },
};

describe("useTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("initializes with keepMounted false when shouldMount starts false", () => {
    const { keepMounted, style } = useTransition(false, {
      transition: testTransition,
      duration: 100,
    });

    expect(keepMounted()).toBe(false);
    expect(style().opacity).toBe(0);
  });

  it("initializes with keepMounted true when shouldMount starts true", () => {
    const { keepMounted, style } = useTransition(true, {
      transition: testTransition,
      duration: 100,
    });

    expect(keepMounted()).toBe(true);
    expect(style().opacity).toBe(1);
  });

  it("transitions through phases when shouldMount changes to true", () => {
    const shouldMount = createValue(false);
    const onBeforeEnter = vi.fn();
    const onAfterEnter = vi.fn();

    const { keepMounted, style } = useTransition(shouldMount, {
      transition: testTransition,
      duration: 200,
      delay: 20,
      onBeforeEnter,
      onAfterEnter,
    });

    expect(keepMounted()).toBe(false);

    // Trigger enter
    shouldMount(true);
    expect(keepMounted()).toBe(true); // mounted immediately in beforeEnter
    expect(style().opacity).toBe(0); // beforeEnter phase maps to "out"

    // Advance to enter phase (after delay)
    vi.advanceTimersByTime(20);
    expect(onBeforeEnter).toHaveBeenCalledTimes(1);
    expect(style().opacity).toBe(1); // enter phase maps to "in"

    // Advance to afterEnter phase (after delay + duration)
    vi.advanceTimersByTime(200);
    expect(onAfterEnter).toHaveBeenCalledTimes(1);
    expect(keepMounted()).toBe(true);
  });

  it("keeps mounted during exit transition until duration completes", () => {
    const shouldMount = createValue(true);
    const onBeforeExit = vi.fn();
    const onAfterExit = vi.fn();

    const { keepMounted, style } = useTransition(shouldMount, {
      transition: testTransition,
      duration: 150,
      delay: 10,
      onBeforeExit,
      onAfterExit,
    });

    expect(keepMounted()).toBe(true);

    // Trigger exit
    shouldMount(false);

    // Keep mounted during beforeExit
    expect(keepMounted()).toBe(true);

    // Advance delay
    vi.advanceTimersByTime(10);
    expect(onBeforeExit).toHaveBeenCalledTimes(1);
    expect(keepMounted()).toBe(true);
    expect(style().opacity).toBe(0); // exit phase maps to "out"

    // Advance duration
    vi.advanceTimersByTime(150);
    expect(onAfterExit).toHaveBeenCalledTimes(1);
    expect(keepMounted()).toBe(false); // Finally unmounted afterExit
  });
});
