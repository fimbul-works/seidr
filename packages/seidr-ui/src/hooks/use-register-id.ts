import type { CleanupFunction, Value } from "@fimbul-works/seidr";

export type IdSetter =
  | Value<string | undefined>
  | ((id: string | undefined) => void);

/**
 * Creates an ID registration function that sets an ID into coordinator state
 * and returns a cleanup function that unregisters/resets it.
 *
 * Ported from Kobalte's createRegisterId primitive.
 */
export function useRegisterId(
  setter: IdSetter,
): (id: string) => CleanupFunction {
  return (id: string): CleanupFunction => {
    setter(id);
    return () => setter(undefined);
  };
}
