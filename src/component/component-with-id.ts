import { getAppState } from "../app-state/app-state";
import { fastMixHash } from "../util/fast-mix-hash";
import { isComponentFactory } from "../util/type-guards/component-types";
import { isNum } from "../util/type-guards/primitive-types";
import { component } from "./component";
import { DATA_NEXT_COMPONENT_ID } from "./constants";
import type { ComponentFactory, ComponentFactoryFunction } from "./types";

/**
 * Creates a component with a unique identifier.
 *
 * @template P - The props type
 * @param {unknown} id - Unique identifier for the component
 * @param {ComponentFactoryFunction<P>} factory - A pure function or a ComponentFactory
 * @param {string} [name] - Optional name to assign the component if it isn't already wrapped
 * @returns {ComponentFactory<P>} The wrapped ComponentFactory
 */
export const componentWithId = <P = void>(
  id: unknown,
  factory: ComponentFactoryFunction<P>,
  name?: string,
): ComponentFactory<P> => {
  getAppState().setData(DATA_NEXT_COMPONENT_ID, isNum(id) ? id : fastMixHash(id));
  return isComponentFactory<P>(factory) ? factory : component<P>(factory, name);
};
