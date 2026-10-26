import { isUndef } from "@fimbul-works/hvat";
import type { SeidrChild, SeidrElementProps } from "@fimbul-works/seidr";
import { $, isValue, mergeValues, unwrapValue, type Value, wrapValue } from "@fimbul-works/seidr";
import { NO_HYDRATE } from "../constants.js";
import { getRouterState } from "../get-router-state.js";
import { useNavigate } from "../hooks/use-navigate.js";
import { initRouter } from "../init-router.js";
import { parseRouteParams } from "../parse-route-params.js";
import { getNearestRouter } from "../router-tree/get-nearest-router.js";
import type { RouterTreeNode } from "../types.js";

/**
 * Checks whether a destination route is active given the current URL and optional local pathname.
 *
 * @param {string} to - Target link path or URL
 * @param {URL} currentUrl - Current active URL
 * @param {string} localPathname - Optional local pathname in nested routers
 * @param {string} ancestorPrefix - Optional prefix matched by ancestor routers
 * @param {boolean} exact - Whether the match must be exact
 * @returns {boolean} True if the link is active
 */
export const isLinkActive = (
  to: string,
  currentUrl: URL,
  localPathname?: string,
  ancestorPrefix?: string,
  exact?: boolean,
): boolean => {
  const currentPath = currentUrl?.pathname.replace(/\/+$/, "") || "/";

  // Parse `to` into path, search, and hash
  const [toPathAndQuery, toHashRaw] = to.split("#");
  const [toPathRaw, toSearchRaw] = toPathAndQuery.split("?");
  const toPath = toPathRaw.replace(/\/+$/, "") || "/";

  // 1. Check Hash
  if (toHashRaw !== undefined) {
    const expectedHash = toHashRaw ? `#${toHashRaw}` : "";
    if (currentUrl.hash !== expectedHash) {
      return false;
    }
  }

  // 2. Check Query Parameters
  const toParams = new URLSearchParams(toSearchRaw || "");
  const currentParams = currentUrl.searchParams;

  if (toSearchRaw !== undefined) {
    // If query parameters were specified in `to`, all must match currentUrl
    for (const [key, value] of toParams.entries()) {
      if (currentParams.get(key) !== value) {
        return false;
      }
    }
    // If exact matching is requested, ensure no extra query parameters exist
    if (exact === true) {
      for (const [key] of currentParams.entries()) {
        if (!toParams.has(key)) {
          return false;
        }
      }
    }
  } else if (exact === true && currentUrl.search !== "") {
    // When exact === true is explicitly requested and no query params were specified,
    // currentUrl must have no query params
    return false;
  }

  // 3. Check Pathname
  const isExactPath = exact !== false;

  // Root path "/" should only match "/" unless it explicitly has a wildcard
  if (toPath === "/" && !toPathRaw.includes("*")) {
    return currentPath === "/" || localPathname === "/";
  }

  const matchCurrent = parseRouteParams(toPath, currentPath, isExactPath) !== false;
  const matchLocal = localPathname
    ? parseRouteParams(toPath, localPathname.replace(/\/+$/, "") || "/", isExactPath) !== false
    : false;

  let matchPrefix = false;
  if (ancestorPrefix && currentPath.startsWith(ancestorPrefix)) {
    const remaining = currentPath.slice(ancestorPrefix.length) || "/";
    const normalizedRemaining = remaining.startsWith("/") ? remaining : `/${remaining}`;
    matchPrefix = parseRouteParams(toPath, normalizedRemaining, isExactPath) !== false;
  }

  return matchCurrent || matchLocal || matchPrefix;
};

/**
 * Link component props.
 */
export interface LinkOptions<K extends keyof HTMLElementTagNameMap = "a"> {
  /** The route to navigate to */
  to: Value<string> | string;
  /** Optional HTML tag name (default: "a") */
  tagName?: K;
  /** Class name to apply to the element */
  className?: string | Value<string>;
  /** Class name to apply when the link is active */
  activeClass?: string | Value<string>;
  /** Class name to apply when the link is inactive */
  inactiveClass?: string | Value<string>;
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
  disabled?: boolean | Value<boolean>;
}

export type LinkProps<K extends keyof HTMLElementTagNameMap = "a"> = LinkOptions<K> &
  Omit<SeidrElementProps<K>, "to" | "ariaCurrent">;

/**
 * Link element factory.
 *
 * @template K - Key from the HTMLElementTagNameMap interface
 * @param {LinkProps<K>} props - Link props with reactive bindings
 * @param {SeidrChild | SeidrChild[]} [children] - Optional child nodes
 * @returns {HTMLElementTagNameMap[K]} Element that wraps an anchor element
 */
export const Link = <K extends keyof HTMLElementTagNameMap = "a">(
  {
    to,
    tagName = "a" as K,
    className: rawClassName,
    activeClass: activeClassName,
    inactiveClass: inactiveClassName,
    exact,
    ariaCurrent,
    disabled,
    ...restProps
  }: LinkProps<K>,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K] => {
  initRouter();
  const navigate = useNavigate();
  const href = wrapValue(to, NO_HYDRATE);
  const url = getRouterState().url;
  const nearest = getNearestRouter();
  const localPath = nearest?.pathname;

  // Find the prefix matched by the nearest routers
  let ancestorPrefix = "";
  if (nearest) {
    let current: RouterTreeNode | null | undefined = nearest;
    const state = getRouterState();
    while (current) {
      if (current.matchedPath) {
        ancestorPrefix = current.matchedPath + ancestorPrefix;
      }
      current = current.parentId !== undefined ? state.tree.get(current.parentId) : undefined;
    }
  }

  // Determine link active status
  const hasDynamicClass = activeClassName !== undefined || inactiveClassName !== undefined;
  const classNameParents: Value[] = [href, url, localPath, activeClassName, inactiveClassName, rawClassName].filter(
    isValue,
  );

  // Determine className based on active/inactive states
  const className = hasDynamicClass
    ? mergeValues(
        () => {
          const active = isLinkActive(href(), url(), localPath?.(), ancestorPrefix, exact);

          const classes: string[] = [];
          const base = unwrapValue(rawClassName);
          if (base) {
            classes.push(base);
          }

          if (active) {
            const activeVal = unwrapValue(activeClassName);
            if (activeVal) classes.push(activeVal);
          } else {
            const inactiveVal = unwrapValue(inactiveClassName);
            if (inactiveVal) classes.push(inactiveVal);
          }

          return classes.length > 0 ? classes.join(" ") : undefined;
        },
        { parents: classNameParents },
      )
    : rawClassName;

  // Determine aria-current when active
  const shouldTrackAriaCurrent = !isUndef(ariaCurrent) ? ariaCurrent !== false : !isUndef(activeClassName);

  const ariaCurrentParents: Value[] = [href, url, localPath, isValue(ariaCurrent) ? ariaCurrent : null].filter(isValue);

  const resolvedAriaCurrent = shouldTrackAriaCurrent
    ? mergeValues(
        () => {
          const active = isLinkActive(href(), url(), localPath?.(), ancestorPrefix, exact);
          if (!active) {
            return undefined;
          }
          const val = unwrapValue(ariaCurrent);
          return val === true || val === undefined ? "page" : (val as string);
        },
        { parents: ariaCurrentParents },
      )
    : undefined;

  // Disabled state
  const isDisabled = isValue(disabled) ? disabled : undefined;
  const isCurrentlyDisabled = () => (isDisabled ? !!isDisabled() : !!disabled);

  const ariaDisabled = isDisabled ? isDisabled.as((d) => (d ? "true" : undefined)) : disabled ? "true" : undefined;

  const dataDisabled = isDisabled ? isDisabled.as((d) => (d ? "" : undefined)) : disabled ? "" : undefined;

  const isCustomElement = (tagName as string) !== "a";
  const role = isCustomElement ? ((restProps as any).role ?? "link") : (restProps as any).role;
  const tabIndex = isCustomElement
    ? ((restProps as any).tabIndex ??
      (isDisabled ? isDisabled.as((d) => (d ? undefined : 0)) : disabled ? undefined : 0))
    : (restProps as any).tabIndex;

  const onclick = (e: Event) => {
    e.preventDefault();
    if (isCurrentlyDisabled()) {
      return;
    }
    navigate(unwrapValue(href));
    (restProps as any).onclick?.(e);
  };

  const onkeydown = isCustomElement
    ? (e: KeyboardEvent) => {
        if (e.key === "Enter" && !isCurrentlyDisabled()) {
          e.preventDefault();
          navigate(unwrapValue(href));
        }
        (restProps as any).onkeydown?.(e);
      }
    : (restProps as any).onkeydown;

  const elementProps: any = {
    className,
    ...restProps,
    onclick,
  };

  if (!isCustomElement && !disabled) {
    elementProps.href = href;
  }
  if (role !== undefined) {
    elementProps.role = role;
  }
  if (tabIndex !== undefined) {
    elementProps.tabIndex = tabIndex;
  }
  if (resolvedAriaCurrent !== undefined) {
    elementProps.ariaCurrent = resolvedAriaCurrent;
  }
  if (ariaDisabled !== undefined) {
    elementProps.ariaDisabled = ariaDisabled;
  }
  if (dataDisabled !== undefined) {
    elementProps.dataDisabled = dataDisabled;
  }
  if (onkeydown !== undefined) {
    elementProps.onkeydown = onkeydown;
  }

  return $(tagName as K, elementProps as SeidrElementProps<K>, children);
};
