import { $ } from "../../element/create-element.js";
import type { SeidrChild, SeidrElementProps } from "../../element/types.js";
import { isValue } from "../../observable/type-guards.js";
import { unwrapValue } from "../../observable/unwrap-value.js";
import { mergeValues, type Value } from "../../observable/value.js";
import { wrapValue } from "../../observable/wrap-value.js";
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
export interface LinkProps<K extends keyof HTMLElementTagNameMap = "a"> {
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
  exact?: boolean | Value<boolean>;
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
  {
    to,
    tagName = "a" as K,
    className: rawClassName,
    activeClass: activeClassName,
    inactiveClass: inactiveClassName,
    exact,
    ...restProps
  }: LinkProps<K> & SeidrElementProps<K>,
  children?: SeidrChild | SeidrChild[],
): HTMLElementTagNameMap[K] => {
  initRouter();
  const navigate = useNavigate();
  const href = wrapValue(to, { hydrate: false }).as((t) => t);
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
  const classNameParents: Value<any>[] = [href, url];
  if (localPath) classNameParents.push(localPath);
  if (isValue(activeClassName)) classNameParents.push(activeClassName);
  if (isValue(inactiveClassName)) classNameParents.push(inactiveClassName);
  if (isValue(rawClassName)) classNameParents.push(rawClassName);
  if (isValue(exact)) classNameParents.push(exact);

  // Determine className based on active/inactive states
  const className = hasDynamicClass
    ? mergeValues(
        () => {
          const active = isLinkActive(
            href(),
            unwrapValue(url()),
            localPath ? unwrapValue(localPath()) : undefined,
            ancestorPrefix || undefined,
            unwrapValue(exact),
          );

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
        { parents: classNameParents, hydrate: false },
      )
    : rawClassName;

  return $(
    tagName as K,
    {
      href,
      className,
      ...restProps,
      onclick: (e: Event) => {
        e.preventDefault();
        navigate(unwrapValue(href));
      },
    } as SeidrElementProps<K>,
    children,
  );
};
