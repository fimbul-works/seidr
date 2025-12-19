/**
 * Debounce calling a function by a certain amount of time.
 * @param callback - Callback to invoke after `waitMs` has expired
 * @param waitMs - Milliseconds to wait before invoking the callback
 * @returns Debounced callback
 */
export function debounce(callback: (...args: unknown[]) => unknown, waitMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), waitMs);
  };
}

/**
 * Build a list of className strings from an assorted types of values.
 * @param classes - Any type of element really
 * @returns A string of classNames
 */
export const cn = (...classes: unknown[]): string =>
  classes
    .filter(Boolean)
    .flatMap((c: unknown): string =>
      Array.isArray(c) ? (cn(...c) as string) : typeof c === "function" ? (cn(c()) as string) : String(c),
    )
    .filter((value: string, index: number, self: string[]): boolean => self.indexOf(value) === index)
    .map((c) => c.trim())
    .filter(Boolean)
    .join(" ");
