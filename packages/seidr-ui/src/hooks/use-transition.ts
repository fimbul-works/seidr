import { createValue, inClient, isServer, isValue, onUnmounted, unwrapValue, type Value } from "@fimbul-works/seidr";

export interface TransitionStyles {
  /** Styles for mounted state. */
  in: Record<string, string | number>;

  /** Styles for unmounted state. */
  out: Record<string, string | number>;

  /** Styles for both mounted and unmounted states. */
  common?: Record<string, string | number>;
}

const TRANSITION_PHASES_MAP = {
  beforeEnter: "out",
  enter: "in",
  afterEnter: "in",
  beforeExit: "in",
  exit: "out",
  afterExit: "out",
} as const;

export type TransitionPhase = keyof typeof TRANSITION_PHASES_MAP;

export interface UseTransitionOptions {
  /** The transition styles. */
  transition: TransitionStyles;

  /** Transitions duration (in ms). */
  duration?: number;

  /** Exit transition duration (in ms). */
  exitDuration?: number;

  /** Delay before starting transitions (in ms). */
  delay?: number;

  /** Delay before starting the exit transition (in ms). */
  exitDelay?: number;

  /** Transitions timing function. */
  easing?: string;

  /** Exit transition timing function. */
  exitEasing?: string;

  /** A function that will be called when enter transition starts. */
  onBeforeEnter?: () => void;

  /** A function that will be called when enter transition ends. */
  onAfterEnter?: () => void;

  /** A function that will be called when exit transition starts. */
  onBeforeExit?: () => void;

  /** A function that will be called when exit transition ends. */
  onAfterExit?: () => void;
}

export interface UseTransitionResult {
  /** Whether the element should be kept in the DOM. */
  keepMounted: Value<boolean>;

  /** The transition style to apply on the element. */
  style: Value<Record<string, string | number>>;
}

const DEFAULT_DURATION = 250;
const DEFAULT_DELAY = 10;
const DEFAULT_EASING = "ease";

function getTransitionProperty(transitionStyles: TransitionStyles): string {
  return [...new Set([...Object.keys(transitionStyles.in || {}), ...Object.keys(transitionStyles.out || {})])].join(
    ", ",
  );
}

export function getTransitionStyles(params: {
  transition: TransitionStyles;
  phase: TransitionPhase;
  duration: number;
  easing?: string;
}): Record<string, string | number> {
  const shared: Record<string, string | number> = {
    "transition-duration": `${params.duration}ms`,
    ...(params.easing ? { "transition-timing-function": params.easing } : {}),
  };

  const property = getTransitionProperty(params.transition);

  return {
    ...(property ? { "transition-property": property } : {}),
    ...shared,
    ...params.transition.common,
    ...params.transition[TRANSITION_PHASES_MAP[params.phase]],
  };
}

/**
 * Primitive for managing enter/exit CSS transitions.
 * Keeps DOM elements mounted during exit transitions before unmounting.
 *
 * Ported from Kobalte's createTransition primitive.
 */
export function useTransition(
  shouldMount: boolean | Value<boolean>,
  options: UseTransitionOptions,
): UseTransitionResult {
  const initialMount = !!unwrapValue(shouldMount);
  const initialPhase: TransitionPhase = initialMount ? "afterEnter" : "afterExit";

  const phase = createValue<TransitionPhase>(initialPhase, { hydrate: false });
  const keepMounted = phase.as((p) => p !== "afterExit");

  const durationVal = createValue<number>(
    initialMount
      ? (options.duration ?? DEFAULT_DURATION)
      : (options.exitDuration ?? options.duration ?? DEFAULT_DURATION),
    { hydrate: false },
  );

  const easingVal = createValue<string>(
    initialMount ? (options.easing ?? DEFAULT_EASING) : (options.exitEasing ?? options.easing ?? DEFAULT_EASING),
    { hydrate: false },
  );

  const style = createValue<Record<string, string | number>>(
    getTransitionStyles({
      transition: options.transition,
      phase: initialPhase,
      duration: durationVal(),
      easing: easingVal(),
    }),
    { hydrate: false },
  );

  const updateStyle = () => {
    style(
      getTransitionStyles({
        transition: options.transition,
        phase: phase(),
        duration: durationVal(),
        easing: easingVal(),
      }),
    );
  };

  let preTimeoutId = 0;
  let postTimeoutId = 0;

  const clearTimers = () => {
    if (typeof window !== "undefined") {
      window.clearTimeout(preTimeoutId);
      window.clearTimeout(postTimeoutId);
    }
  };

  const handleStateChange = (mount: boolean) => {
    if (isServer()) return;

    clearTimers();

    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const dur = prefersReducedMotion
      ? 0
      : mount
        ? (options.duration ?? DEFAULT_DURATION)
        : (options.exitDuration ?? options.duration ?? DEFAULT_DURATION);

    const eas = mount ? (options.easing ?? DEFAULT_EASING) : (options.exitEasing ?? options.easing ?? DEFAULT_EASING);

    const del = prefersReducedMotion
      ? 0
      : mount
        ? (options.delay ?? DEFAULT_DELAY)
        : (options.exitDelay ?? options.delay ?? DEFAULT_DELAY);

    durationVal(dur);
    easingVal(eas);

    const preHandler = mount ? options.onBeforeEnter : options.onBeforeExit;
    const postHandler = mount ? options.onAfterEnter : options.onAfterExit;

    phase(mount ? "beforeEnter" : "beforeExit");
    updateStyle();

    if (dur === 0) {
      preHandler?.();
      postHandler?.();
      phase(mount ? "afterEnter" : "afterExit");
      updateStyle();
      return;
    }

    preTimeoutId = window.setTimeout(() => {
      preHandler?.();
      phase(mount ? "enter" : "exit");
      updateStyle();
    }, del);

    postTimeoutId = window.setTimeout(() => {
      postHandler?.();
      phase(mount ? "afterEnter" : "afterExit");
      updateStyle();
    }, del + dur);
  };

  inClient(() => {
    if (isValue(shouldMount)) {
      onUnmounted(
        shouldMount.watch((next) => {
          handleStateChange(Boolean(next));
        }),
      );
    }
  });

  onUnmounted(clearTimers);

  return { keepMounted, style };
}
