import { $ } from "../../element/create-element.js";
import type { SeidrChild, SeidrElementProps } from "../../element/types.js";
import { isValue } from "../../observable/type-guards.js";
import { unwrapValue } from "../../observable/unwrap-value.js";
import { mergeValues, type Value } from "../../observable/value.js";
import { wrapValue } from "../../observable/wrap-value.js";
import { getRouterState } from "../get-router-state.js";
import { useNavigate } from "../hooks/use-navigate.js";
import { initRouter } from "../init-router.js";

/**
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap = "a"> {
  /** The route to navigate to */
  to: Value<string> | string;
  /** Optional HTML tag name (default: "a") */
  tagName?: K;
  /** Class name to apply when the link is active */
  activeClass?: string | Value<string>;
  /** Class name to apply when the link is inactive */
  inactiveClass?: string | Value<string>;
  /** Class name to apply to the element */
  className?: string | Value<string>;
}

/**
 * Link element factory.
 *
 * @template K - Key from the HTMLElementTagNameMap interface
 * @param {LinkProps<K> & SeidrElementProps<K>} props - Link props with reactive bindings
 * @param {SeidrChild | SeidrChild[]} [children] - Optional child nodes
 * @returns {HTMLElementTagNameMap[K]} Element that wraps an anchor element
 */
export const Link = <K extends keyof HTMLElementTagNameMap = "a">(
  { to, tagName = "a" as K, activeClass, inactiveClass, className, ...restProps }: LinkProps<K> & SeidrElementProps<K>,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K] => {
  initRouter();
  const navigate = useNavigate();
  const href = wrapValue(to, { hydrate: false }).as((t) => t);
  const url = getRouterState().url;

  // Determine link active status
  const classNameParents: Value<any>[] = [href, url];
  if (isValue(activeClass)) classNameParents.push(activeClass);
  if (isValue(inactiveClass)) classNameParents.push(inactiveClass);
  if (isValue(className)) classNameParents.push(className);

  const cn = mergeValues(
    () => {
      const currentUrl = unwrapValue(url());
      const classNames = [unwrapValue(className)];
      if (activeClass && href() === currentUrl.pathname + currentUrl.search) {
        classNames.push(unwrapValue(activeClass));
      } else if (inactiveClass) {
        classNames.push(unwrapValue(inactiveClass));
      }
      return classNames.join(" ");
    },
    { parents: classNameParents, hydrate: false },
  );

  return $(
    tagName as K,
    {
      href,
      className: cn,
      ...restProps,
      onclick: (e: Event) => {
        e.preventDefault();
        navigate(unwrapValue(href));
      },
    } as SeidrElementProps<K>,
    children,
  );
};
