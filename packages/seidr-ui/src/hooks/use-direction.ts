import {
  type CleanupFunction,
  getAppState,
  isNullish,
  onUnmounted,
  SeidrError,
  unwrapValue,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";

/**
 * Text reading direction constant mapping.
 */
export const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;

/**
 * Text reading direction type.
 */
export type Direction = (typeof Direction)[keyof typeof Direction];

const DIRECTION_STACK_KEY = "seidr-ui.direction:stack";

type StackEntry = Value<string>;

const getDirectionStack = (): StackEntry[] => getAppState().getData<StackEntry[]>(DIRECTION_STACK_KEY, []);

/**
 * Resolves the effective text direction.
 *
 * If a valid direction is provided, it is pushed to the top of the global direction stack,
 * updating the direction for the component and its descendants, and automatically popped
 * when the component unmounts.
 *
 * If called without arguments or with a nullish value, it returns the current direction
 * from the top of the stack.
 *
 * @param {Direction | Value<Direction | undefined | null>} [dir] - Optional direction override.
 * @returns {Value<string>} Reactive direction Value.
 * @throws {SeidrError} If an invalid non-nullish direction is provided.
 *
 * Ported from https://github.com/radix-ui/primitives/blob/main/packages/react/direction/src/direction.tsx
 * MIT License, Copyright (c) WorkOS.
 */
export function useDirection(dir?: Direction | Value<Direction> | null): Value<string> {
  const stack = getDirectionStack();
  const unwrapped = unwrapValue(dir);

  if (isNullish(unwrapped)) {
    return stack[stack.length - 1] ?? wrapValue("ltr");
  }

  if (unwrapped !== "ltr" && unwrapped !== "rtl") {
    throw new SeidrError(`Invalid direction "${unwrapped}": must be "ltr" or "rtl"`);
  }

  const entry = wrapValue<string>(dir as string);
  stack.push(entry);

  const popStack: CleanupFunction = () => {
    const idx = stack.indexOf(entry);
    if (idx > -1) stack.splice(idx, 1);
  };

  onUnmounted(popStack);

  return entry;
}

/**
 * Returns the current direction from the top of the stack.
 * @returns {Direction}
 */
export const getDirection = () => unwrapValue(useDirection()) as Direction;

/**
 * Resets the direction stack to its initial default state.
 *
 * @internal Used in testing.
 */
export const resetDirection = () => (getDirectionStack().length = 0);
