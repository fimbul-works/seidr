import { component } from "../../component/component";
import type { Component } from "../../component/types";
import { useScope } from "../../component/use-scope";
import { $, type SeidrChild, type SeidrElementProps } from "../../element";
import type { Seidr } from "../../seidr/seidr";
import { unwrapSeidr } from "../../seidr/unwrap-seidr";
import { useNavigate } from "../hooks";

/**
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap> {
  to: string | Seidr<string>;
  tagName?: K;
}

/**
 * Link component for Route.
 * @template K - Key from the HTMLElementTagNameMap interface
 * @param {LinkProps & SeidrElementProps<K>} props - Link props with reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Optional child nodes (default: `[]`)
 * @returns {Component} Component that wraps an anchor element
 */
export const Link = <K extends keyof HTMLElementTagNameMap = "a">(
  { to, tagName = "a" as K, ...restProps }: LinkProps<K> & SeidrElementProps<K>,
  children: SeidrChild[] = [],
): Component =>
  component(() => {
    const navigate = useNavigate();
    const scope = useScope();

    const el = $(
      tagName as K,
      {
        href: to,
        ...restProps,
      } as SeidrElementProps<K>,
      children,
    );

    const onclick = (e: Event) => {
      e.preventDefault();
      navigate(unwrapSeidr(to));
    };

    el.addEventListener("click", onclick);
    scope.track(() => el.removeEventListener("click", onclick));

    return el;
  }, "Link")();
