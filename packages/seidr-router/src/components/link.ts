import { isTruthy, isUndef } from "@fimbul-works/hvat";
import type { Observable, ReactiveValue, SeidrChild, SeidrElementProps } from "@fimbul-works/seidr";
import { $, isObservable, isValue, mergeValues, unwrapValue, type Value, wrapValue } from "@fimbul-works/seidr";
import { NO_HYDRATE } from "../constants.js";
import { getRouterState } from "../get-router-state.js";
import { useNavigate } from "../hooks/use-navigate.js";
import { initRouter } from "../init-router.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";
import type { RouterTreeNode } from "../types.js";
import { isLinkActive } from "../util/is-link-active.js";

/**
 * Link component props.
 */
export interface LinkOptions<T extends keyof HTMLElementTagNameMap = "a"> {
  /** The URL to navigate to */
  href: ReactiveValue<string>;
  /** Optional HTML tag name (default: "a") */
  as?: T;
  /** Class name to apply to the element */
  className?: ReactiveValue<string | undefined>;
  /** Class name to apply when the link is active */
  activeClass?: ReactiveValue<string | undefined>;
  /** Class name to apply when the link is inactive */
  inactiveClass?: ReactiveValue<string | undefined>;
  /** Whether the route match must be exact */
  exact?: boolean;
  /** The aria-current attribute value to apply when active (default: "page"). Set to false to disable. */
  ariaCurrent?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | "true"
    | "false"
    | boolean
    | Value<string | boolean | undefined | null>;
  /** Whether the link is disabled */
  disabled?: ReactiveValue<boolean>;
}

export type LinkProps<K extends keyof HTMLElementTagNameMap = "a"> = LinkOptions<K> &
  Omit<SeidrElementProps<K>, "to" | "ariaCurrent">;

/**
 * Link element factory.
 *
 * @template T - Key from the HTMLElementTagNameMap interface
 * @param {LinkProps<T>} props - Link props with reactive bindings
 * @param {SeidrChild | SeidrChild[]} [children] - Optional child nodes
 * @returns {HTMLElementTagNameMap[T]} Element that wraps an anchor element
 */
export const Link = <T extends keyof HTMLElementTagNameMap = "a">(
  {
    href,
    as = "a" as T,
    className: rawClassName,
    activeClass: activeClassName,
    inactiveClass: inactiveClassName,
    exact,
    ariaCurrent,
    disabled,
    ...restProps
  }: LinkProps<T>,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[T] => {
  initRouter();

  href = wrapValue(href, NO_HYDRATE);

  const state = getRouterState();
  const navigate = useNavigate();
  const url = state.url;

  // Derive local state from URL
  const ancestorPrefix = url.as(() => {
    const nearest = getNearestRouter();
    if (!nearest) {
      return undefined;
    }
    let ancestorPrefix = "";
    let current: RouterTreeNode | false | undefined = nearest;
    while (current) {
      if (current.matchedPath) {
        ancestorPrefix = current.matchedPath + ancestorPrefix;
      }
      current = !isUndef(current.parentId) && state.tree.get(current.parentId);
    }
    return ancestorPrefix;
  });
  const localPath = url.as(() => getNearestRouter()?.pathname());
  const isActive = url.as(() => isLinkActive(href(), url(), localPath(), ancestorPrefix(), exact));

  // Determine link active status
  const hasDynamicClass = !isUndef(activeClassName) || !isUndef(inactiveClassName);
  const classNameParents = [isActive, activeClassName, inactiveClassName, rawClassName].filter(isObservable);

  // Determine className based on active/inactive states
  const className = hasDynamicClass
    ? mergeValues(
        () => {
          const classes = [
            unwrapValue(rawClassName),
            isActive() ? unwrapValue(activeClassName) : unwrapValue(inactiveClassName),
          ].filter(isTruthy);
          return classes.length > 0 ? classes.join(" ") : undefined;
        },
        { parents: classNameParents },
      )
    : rawClassName;

  // Determine aria-current when active
  const ariaCurrentParents = [isActive, ariaCurrent].filter(isObservable) as Observable[];
  const resolvedAriaCurrent =
    ariaCurrentParents.length > 0
      ? mergeValues(
          () => {
            if (!isActive()) {
              return null;
            }
            const val = unwrapValue(ariaCurrent);
            return val === false ? undefined : val === true || isUndef(val) ? "page" : val;
          },
          { parents: ariaCurrentParents },
        )
      : undefined;

  // Disabled state
  const isDisabled = wrapValue(disabled ?? false, NO_HYDRATE);

  const ariaDisabled = isDisabled.as((d) => (d ? "true" : undefined));
  const dataDisabled = isDisabled.as((d) => (d ? "" : undefined));

  const isCustomElement = as !== "a";
  const role = isCustomElement ? ((restProps as any).role ?? "link") : (restProps as any).role;
  const tabIndex = isCustomElement
    ? ((restProps as any).tabIndex ??
      (isDisabled ? isDisabled.as((d) => (d ? undefined : 0)) : disabled ? undefined : 0))
    : (restProps as any).tabIndex;

  const onclick = (e: Event) => {
    e.preventDefault();
    if (isDisabled()) {
      return;
    }
    navigate(unwrapValue(href));
    (restProps as any).onclick?.(e);
  };

  const onkeydown = isCustomElement
    ? (e: KeyboardEvent) => {
        if (e.key === "Enter" && !isDisabled()) {
          e.preventDefault();
          navigate(unwrapValue(href));
        }
        (restProps as any).onkeydown?.(e);
      }
    : (restProps as any).onkeydown;

  const elementProps: Record<string, unknown> = {
    className,
    ...restProps,
    role,
    tabIndex,
    ariaCurrent: resolvedAriaCurrent,
    ariaDisabled,
    dataDisabled,
    onclick,
    onkeydown,
  };

  if (!isCustomElement && !disabled) {
    elementProps.href = href;
  }

  return $(as, elementProps as SeidrElementProps<T>, children);
};
