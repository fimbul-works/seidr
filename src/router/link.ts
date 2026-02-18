import { component } from "../component/component";
import type { Component } from "../component/types";
import { useScope } from "../component/use-scope";
import { $, type SeidrChild, type SeidrElementProps } from "../element";
import { NO_HYDRATE } from "../seidr/constants";
import { Seidr } from "../seidr/seidr";
import { unwrapSeidr } from "../seidr/unwrap-seidr";
import { useNavigate } from "./hooks";

/**
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap> {
  to: string | Seidr<string>;
  tagName?: K;
  activeClass?: string;
  activeProp?: string;
  activeValue?: any;
}

/**
 * Link component for Route.
 * @param {LinkProps & SeidrElementProps<K>} props - Link props with reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Optional child nodes (default: `[]`)
 * @returns {Component} Component that wraps an anchor element
 */
export const Link = <K extends keyof HTMLElementTagNameMap = "a">(
  { to, tagName = "a" as K, ...restProps }: LinkProps<K> & SeidrElementProps<K>,
  children: SeidrChild[] = [],
): Component =>
  component(() => {
    const scope = useScope();
    const { navigate } = useNavigate();

    // If to is a Seidr, observe it; otherwise wrap it in a Seidr
    // We opt-out of hydration for this internal Seidr to save space
    const toValue = new Seidr(unwrapSeidr(to), NO_HYDRATE);

    const el = $(tagName as K, restProps as any, children);
    scope.track(
      el.on("click", (e: Event) => {
        e.preventDefault();
        navigate(unwrapSeidr(toValue));
      }),
    );

    return el;
  }, "Link")();
