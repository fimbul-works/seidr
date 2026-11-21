import { isNullish, isObj } from "@fimbul-works/hvat";
import { isValidSeidrChild } from "../element/type-guards.js";
import type { SeidrChild } from "../element/types.js";

/**
 * Resolved props and children tuple.
 */
export type ResolvedPropsAndChildren<P> = [props: P, children: SeidrChild];

/**
 * Resolves overloaded (propsOrChildren, children) arguments into a consistent [props, children] tuple.
 *
 * Supports:
 * - Children only: `Component(content)` -> `[{}, content]`
 * - Props and children: `Component(props, content)` -> `[props, content]`
 * - Props only: `Component(props)` -> `[props, undefined]`
 * - No arguments / nullish: `Component()` -> `[{}, undefined]`
 * - Default props: Merges `defaultProps` underneath user props
 *
 * @template P - The props object type
 * @param {P | SeidrChild} propsOrChildren - Either props or children
 * @param {SeidrChild} [children] - Optional children when props are passed as first argument
 * @param {Partial<P>} [defaultProps] - Optional default props to merge
 * @returns {ResolvedPropsAndChildren<P>} Tuple of [props, children]
 */
export function resolvePropsAndChildren<P extends object = Record<string, any>>(
  propsOrChildren?: P | SeidrChild,
  children?: SeidrChild,
  defaultProps?: Partial<P>,
): ResolvedPropsAndChildren<P> {
  let props: P;
  let resolvedChildren: SeidrChild;

  if (!isNullish(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as P) ?? ({} as P);
    resolvedChildren = children ?? undefined;
  } else {
    props = {} as P;
    resolvedChildren = propsOrChildren as SeidrChild;
  }

  if (defaultProps) {
    props = { ...defaultProps, ...props };
  }

  if (isObj(props) && "children" in props) {
    const { children: propsChildren, ...restProps } = props as Record<string, any>;
    props = restProps as P;
    if (resolvedChildren === undefined) {
      resolvedChildren = propsChildren;
    } else if (propsChildren !== undefined) {
      const arr = Array.isArray(resolvedChildren) ? [...resolvedChildren] : [resolvedChildren];
      if (Array.isArray(propsChildren)) {
        arr.push(...propsChildren);
      } else {
        arr.push(propsChildren);
      }
      resolvedChildren = arr;
    }
  }

  return [props, resolvedChildren];
}
