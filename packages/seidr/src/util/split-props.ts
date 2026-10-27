/**
 * Resolved props and children tuple.
 */
export type SplitPropsResultTuple<P, R> = [props: P, rest: R];

/**
 * Split props into reserved and rest.
 *
 * @template T - Props object type.
 * @template K - Keys to reserve type.
 * @template P - Reserved props type.
 * @template R - Rest props type.
 * @param {T} allProps - Object to split.
 * @param {K[]} keys - Array of keys to reserve.
 * @returns {SplitPropsResultTuple<P, R>} Tuple of `[props, restProps]`.
 */
export function splitProps<
  T extends object = Record<string, any>,
  K extends keyof T & string = keyof T & string,
  P = Pick<T, K>,
  R = Omit<T, K>,
>(allProps: T, keys: K[]): SplitPropsResultTuple<P, R> {
  return Object.entries(allProps).reduce(
    (acc, [key, value]) => {
      const [props, restProps] = acc;
      if (keys.includes(key as K)) {
        props[key as keyof P] = value;
      } else {
        restProps[key as keyof R] = value;
      }
      return [props, restProps];
    },
    [{} as P, {} as R],
  );
}
