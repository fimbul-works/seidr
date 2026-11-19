import { getAppState } from "../app-state/get-app-state.js";
import type { CleanupFunction } from "../types.js";
import type { SeidrElementProps, SeidrElementTagNameMap } from "./types.js";

const DATA_KEY_PROP_MUTATORS = "seidr.prop-mutators";

export type PropMutator<
  K extends keyof SeidrElementTagNameMap = keyof SeidrElementTagNameMap,
  E extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
> = (el: E, props: SeidrElementProps<K>) => SeidrElementProps<K>;

/**
 * Registers a prop mutator for a property name.
 * The mutator will be called for each element whose props contain that property.
 *
 * @param {string} propName - The property name that triggers the mutator.
 * @param {PropMutator} mutator - The prop mutator to register.
 * @returns {CleanupFunction} An unregister cleanup function.
 */
export function registerPropMutator(propName: string, mutator: PropMutator): CleanupFunction {
  const appState = getAppState();
  const propMutatorMap = appState.getData<Map<string, PropMutator[]>>(DATA_KEY_PROP_MUTATORS, new Map());
  const propMutators = propMutatorMap.get(propName) ?? [];

  const unregister: CleanupFunction = () => {
    const current = propMutatorMap.get(propName);
    if (!current) {
      return;
    }
    const index = current.indexOf(mutator);
    if (index > -1) {
      current.splice(index, 1);
      if (current.length === 0) {
        propMutatorMap.delete(propName);
      }
    }
  };

  if (!propMutators.includes(mutator)) {
    propMutators.push(mutator);
    propMutatorMap.set(propName, propMutators);
    appState.onDestroy(unregister);
  }

  return unregister;
}

/**
 * Get all registered prop mutators for a property name.
 *
 * @param {string} propName - The property name to look up mutators for.
 * @returns {PropMutator[]} Array of registered prop mutators.
 */
export function getPropMutators(propName: string): PropMutator[] {
  return getAppState().getData<Map<string, PropMutator[]>>(DATA_KEY_PROP_MUTATORS)?.get(propName)?.slice(0) ?? [];
}

/**
 * Applies all registered prop mutators whose trigger property is present in `props`.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 * @template {SeidrElementTagNameMap[K]} E - Element type
 * @param {E} el - Target element
 * @param {SeidrElementProps<K>} props - Element properties
 * @returns {SeidrElementProps<K>} Mutated properties
 */
export function applyPropMutators<
  K extends keyof SeidrElementTagNameMap,
  E extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
>(el: E, props: SeidrElementProps<K>): SeidrElementProps<K> {
  const propMutatorMap = getAppState().getData<Map<string, PropMutator[]>>(DATA_KEY_PROP_MUTATORS);
  if (!propMutatorMap || propMutatorMap.size === 0) {
    return props;
  }

  let currentProps = props;
  for (const [propName, mutators] of propMutatorMap) {
    if (propName in currentProps) {
      for (const mutator of mutators) {
        currentProps = mutator(el, currentProps as SeidrElementProps) as SeidrElementProps<K>;
      }
    }
  }

  return currentProps;
}
