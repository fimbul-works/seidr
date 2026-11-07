import { isNullish } from "@fimbul-works/hvat";
import type { SeidrElementProps, SeidrElementTagNameMap } from "../element/types.js";
import { wrapValue } from "../observable/wrap-value.js";
import { isClient } from "../util/environment/is-client.js";
import { navigate } from "./navigate.js";

/**
 * Handles link element props.
 * Automatically wires anchor tags and link-like elements to the central navigation system,
 * while respecting external links, modifier clicks, and disabled states.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 * @template {SeidrElementTagNameMap[K]} E - Element type
 * @param {E} link - Element to assign properties to
 * @param {SeidrElementProps<K>} props - Properties to assign
 * @returns {SeidrElementProps<K>} Processed properties
 */
export const handleLinkProps = <
  K extends keyof SeidrElementTagNameMap = "a",
  E extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
>(
  link: E,
  props: SeidrElementProps<K>,
): SeidrElementProps<K> => {
  const rawProps = props as Record<string, unknown>;
  const originalHref = rawProps.href;
  const originalDisabled = rawProps.disabled;
  const originalOnClick = rawProps.onclick as ((event: MouseEvent) => void) | undefined;
  const originalTarget = rawProps.target as string | undefined;
  const originalDownload = rawProps.download;
  const originalRole = rawProps.role;
  const originalTabIndex = rawProps.tabIndex ?? rawProps.tabindex;
  const originalAriaDisabled = rawProps.ariaDisabled ?? rawProps["aria-disabled"];
  const originalDataDisabled = rawProps.dataDisabled ?? rawProps["data-disabled"];

  // If there's no href at all and no disabled prop, return props unchanged
  if (isNullish(originalHref) && isNullish(originalDisabled)) {
    return props;
  }

  const isLinkTag = link.tagName.toLowerCase() === "a";
  const wrappedDisabled = wrapValue((originalDisabled as boolean) ?? false);
  const wrappedHref = isNullish(originalHref) ? undefined : wrapValue(originalHref as string);

  // Determine role
  let role = originalRole;
  if (role === undefined) {
    if (!isLinkTag) {
      role = "link";
    } else {
      role = wrappedDisabled.as((disabled) => (disabled ? "link" : undefined));
    }
  }

  // Determine tabIndex
  let tabIndex = originalTabIndex;
  if (tabIndex === undefined && !isLinkTag) {
    tabIndex = wrappedDisabled.as((disabled) => (disabled ? undefined : 0));
  }

  // Disabled attributes (preserve if already provided)
  const ariaDisabled =
    originalAriaDisabled !== undefined
      ? originalAriaDisabled
      : wrappedDisabled.as((disabled) => (disabled ? "true" : undefined));

  const dataDisabled =
    originalDataDisabled !== undefined
      ? originalDataDisabled
      : wrappedDisabled.as((disabled) => (disabled ? "" : undefined));

  // If link is an <a> tag and disabled, href attribute should be removed from DOM
  const href = wrappedHref
    ? wrappedDisabled.as((disabled) => (disabled ? undefined : wrappedHref()))
    : undefined;

  const onclick = (event: MouseEvent): void => {
    // 1. Prevent default and stop if disabled
    if (wrappedDisabled()) {
      event.preventDefault();
      return;
    }

    // 2. Invoke user's original onClick handler if present
    if (typeof originalOnClick === "function") {
      originalOnClick(event);
      if (event.defaultPrevented) {
        return;
      }
    }

    // 3. Modifier keys (Ctrl, Meta, Shift, Alt) or non-primary mouse clicks pass through
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    // 4. Custom target (e.g. _blank, _parent, _top) or download attribute pass through
    if (originalTarget && originalTarget !== "_self") {
      return;
    }
    if (originalDownload) {
      return;
    }

    // 5. If no href, nothing to navigate to
    if (!wrappedHref) {
      return;
    }

    const rawHref = wrappedHref();
    if (!rawHref) {
      return;
    }

    // 6. Check if external link
    const currentOrigin =
      isClient() && window.location.origin !== "null" ? window.location.origin : "http://localhost";

    const isRelative = !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(rawHref) && !rawHref.startsWith("//");
    let isSameOrigin = false;
    let targetPath = rawHref;

    try {
      const parsed = new URL(rawHref, isClient() ? window.location.href : "http://localhost/");
      // Exclude non-http(s) protocols (e.g., mailto:, tel:, javascript:)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return;
      }
      isSameOrigin = parsed.origin === currentOrigin;
      if (isSameOrigin) {
        targetPath = parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      isSameOrigin = false;
    }

    if (!isRelative && !isSameOrigin) {
      return;
    }

    // 7. Dispatch to central navigation system
    if (navigate(targetPath)) {
      event.preventDefault();
    }
  };

  const {
    href: _href,
    disabled: _disabled,
    onclick: _onclick,
    role: _role,
    tabIndex: _tabIndex,
    tabindex: _tabindex,
    ariaDisabled: _ariaDisabled,
    "aria-disabled": _ariaDisabledAttr,
    dataDisabled: _dataDisabled,
    "data-disabled": _dataDisabledAttr,
    ...restProps
  } = rawProps;

  return {
    ...restProps,
    ...(href !== undefined ? { href } : {}),
    ...(originalTarget ? { target: originalTarget } : {}),
    ...(originalDownload ? { download: originalDownload } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(tabIndex !== undefined ? { tabIndex } : {}),
    ...(ariaDisabled !== undefined ? { ariaDisabled } : {}),
    ...(dataDisabled !== undefined ? { dataDisabled } : {}),
    onclick,
  } as unknown as SeidrElementProps<K>;
};
