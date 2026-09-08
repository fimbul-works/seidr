import { $ } from "../../element/create-element.js";
import type { SeidrChild, SeidrElementProps } from "../../element/types.js";
import { unwrapValue } from "../../observable/unwrap-value.js";
import type { Value } from "../../observable/value.js";
import { wrapValue } from "../../observable/wrap-value.js";
import { useNavigate } from "../hooks/use-navigate.js";
import { initRouter } from "../init-router.js";

/**
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap = "a"> {
  /** The route to navigate to */
  to: string | Value<string> | number;
  /** Optional HTML tag name (default: "a") */
  tagName?: K;
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
  { to, tagName = "a" as K, ...restProps }: LinkProps<K> & SeidrElementProps<K>,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K] => {
  initRouter();
  const navigate = useNavigate();
  const href = wrapValue(to as any, { hydrate: false }).as((t) => t);

  return $(
    tagName as K,
    {
      href,
      ...restProps,
      onclick: (e: Event) => {
        e.preventDefault();
        navigate(unwrapValue(href));
      },
    } as SeidrElementProps<K>,
    children,
  );
};
