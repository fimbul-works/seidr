import { isFn, isNullish, isStr } from "@fimbul-works/hvat";
import { getAppState } from "../app-state/get-app-state.js";
import { DEFAULT_BASE_URL } from "../constants.js";
import type { ReactiveValue, SeidrElementProps, SeidrElementTagNameMap } from "../element/types.js";
import { isValue } from "../observable/type-guards.js";
import type { ObservableValue } from "../observable/types.js";
import { unwrapValue } from "../observable/unwrap-value.js";
import { mergeValues } from "../observable/value.js";
import { isClient } from "../util/environment/is-client.js";
import { DATA_KEY_HANDLED_LINK_PROPS } from "./constants.js";
import { navigate } from "./navigate.js";

/**
 * Extended link element properties accepted by {@link handleLinkProps}.
 */
export type LinkElementProps<K extends keyof SeidrElementTagNameMap = "a"> = Omit<
  SeidrElementProps<K>,
  "href" | "disabled" | "target" | "download"
> & {
  href?:
    | ReactiveValue<string>
    | ReactiveValue<URL>
    | ReactiveValue<string | URL>
    | ObservableValue<string | undefined>
    | ObservableValue<URL | undefined>
    | ObservableValue<string | URL | undefined>;
  disabled?: ReactiveValue<boolean> | ObservableValue<boolean | undefined>;
  target?: ReactiveValue<string> | ObservableValue<string | undefined>;
  download?: ReactiveValue<string> | ReactiveValue<boolean> | ObservableValue<string | boolean | undefined>;
};

const formatHref = (val: unknown): string | undefined => {
  if (isNullish(val)) {
    return undefined;
  }
  return val instanceof URL ? val.href : String(val);
};

/**
 * Handles link element props.
 * Automatically wires anchor tags and link-like elements to the central navigation system,
 * while respecting external links, modifier clicks, keyboard activation, and disabled states.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 * @template {SeidrElementTagNameMap[K]} E - Element type
 * @param {E | K} link - Element or tag name to process properties for
 * @param {LinkElementProps<K> | SeidrElementProps<K>} props - Properties to assign
 * @returns {SeidrElementProps<K>} Processed properties
 */
export const handleLinkProps = <
  K extends keyof SeidrElementTagNameMap = "a",
  E extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
>(
  link: E | K,
  props: LinkElementProps<K> | SeidrElementProps<K>,
): SeidrElementProps<K> => {
  const appState = getAppState();
  const existingHandled = appState.getData<WeakSet<object>>(DATA_KEY_HANDLED_LINK_PROPS);
  if (existingHandled?.has(props)) {
    return props as SeidrElementProps<K>;
  }

  const tagName = (isStr(link) ? link : link.tagName).toLowerCase();
  if (tagName === "link" || tagName === "base") {
    return props as SeidrElementProps<K>;
  }

  const rawProps = props as Record<string, unknown>;
  const originalHref = rawProps.href;
  const originalDisabled = rawProps.disabled;
  const originalOnClick = rawProps.onclick as ((event: MouseEvent) => void) | undefined;
  const originalOnKeyDown = rawProps.onkeydown as ((event: KeyboardEvent) => void) | undefined;
  const originalTarget = rawProps.target as ReactiveValue<string | undefined> | undefined;
  const originalDownload = rawProps.download as ReactiveValue<string | boolean | undefined> | undefined;
  const originalRole = rawProps.role;
  const originalTabIndex = rawProps.tabIndex ?? rawProps.tabindex;
  const originalAriaDisabled = rawProps.ariaDisabled ?? rawProps["aria-disabled"];
  const originalDataDisabled = rawProps.dataDisabled ?? rawProps["data-disabled"];

  // If there's no href at all and no disabled prop, return props unchanged
  if (isNullish(originalHref) && isNullish(originalDisabled)) {
    return props as SeidrElementProps<K>;
  }

  const isNativeLink = tagName === "a" || tagName === "area";
  const isButton = tagName === "button";

  const disabledObs = isValue<boolean | undefined>(originalDisabled) ? originalDisabled : undefined;
  const hrefObs = isValue<string | URL | undefined>(originalHref) ? originalHref : undefined;
  const isDisabledStatic = !disabledObs && Boolean(originalDisabled);

  // Determine role
  let role = originalRole;
  if (role === undefined) {
    if (!isNativeLink) {
      role = "link";
    } else if (disabledObs) {
      role = disabledObs.as((disabled) => (disabled ? "link" : undefined));
    } else {
      role = isDisabledStatic ? "link" : undefined;
    }
  }

  // Determine tabIndex
  let tabIndex = originalTabIndex;
  if (tabIndex === undefined && !isNativeLink && !isButton) {
    if (disabledObs) {
      tabIndex = disabledObs.as((disabled) => (disabled ? undefined : 0));
    } else {
      tabIndex = isDisabledStatic ? undefined : 0;
    }
  }

  // Disabled attributes (preserve if already provided)
  const ariaDisabled =
    originalAriaDisabled !== undefined
      ? originalAriaDisabled
      : disabledObs
        ? disabledObs.as((disabled) => (disabled ? "true" : undefined))
        : isDisabledStatic
          ? "true"
          : undefined;

  const dataDisabled =
    originalDataDisabled !== undefined
      ? originalDataDisabled
      : disabledObs
        ? disabledObs.as((disabled) => (disabled ? "" : undefined))
        : isDisabledStatic
          ? ""
          : undefined;

  // Only native link elements receive a DOM href attribute, and disabled removes it
  let href: unknown;
  if (isNativeLink && !isNullish(originalHref)) {
    if (disabledObs && hrefObs) {
      href = mergeValues(() => (disabledObs() ? undefined : formatHref(hrefObs())), {
        parents: [disabledObs, hrefObs],
      });
    } else if (disabledObs) {
      const staticHref = formatHref(originalHref);
      href = disabledObs.as((disabled) => (disabled ? undefined : staticHref));
    } else if (isDisabledStatic) {
      href = undefined;
    } else if (hrefObs) {
      href = hrefObs.as((val) => formatHref(val));
    } else {
      href = formatHref(originalHref);
    }
  }

  const isDisabledNow = (): boolean =>
    Boolean(unwrapValue(originalDisabled)) ||
    unwrapValue(ariaDisabled) === "true" ||
    unwrapValue(ariaDisabled) === true;

  const onclick = (event: MouseEvent): void => {
    // 1. Prevent default and stop if disabled
    if (isDisabledNow()) {
      event.preventDefault();
      return;
    }

    // 2. Invoke user's original onClick handler if present
    if (isFn(originalOnClick)) {
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
    const target = unwrapValue(originalTarget);
    if (target && target !== "_self") {
      return;
    }
    if (unwrapValue(originalDownload)) {
      return;
    }

    // 5. If no href, nothing to navigate to
    const rawHref = formatHref(unwrapValue(originalHref));
    if (!rawHref) {
      return;
    }

    // 6. Check if external link
    const hasWindowLocation = isClient() && window.location.origin !== "null" && window.location.href !== "about:blank";
    const baseHref = hasWindowLocation ? window.location.href : DEFAULT_BASE_URL;
    const currentOrigin = hasWindowLocation ? window.location.origin : new URL(DEFAULT_BASE_URL).origin;

    const isRelative = !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(rawHref) && !rawHref.startsWith("//");
    let isSameOrigin = false;
    let targetPath = rawHref;

    try {
      const parsed = new URL(rawHref, baseHref);
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

  // Keydown handler for custom non-anchor, non-button link elements
  const onkeydown =
    !isNativeLink && !isButton
      ? (event: KeyboardEvent): void => {
          if (isFn(originalOnKeyDown)) {
            originalOnKeyDown(event);
            if (event.defaultPrevented) {
              return;
            }
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (!isDisabledNow()) {
              (event.currentTarget as HTMLElement).click();
            }
          }
        }
      : originalOnKeyDown;

  const {
    href: _href,
    disabled: _disabled,
    onclick: _onclick,
    onkeydown: _onkeydown,
    role: _role,
    tabIndex: _tabIndex,
    tabindex: _tabindex,
    ariaDisabled: _ariaDisabled,
    "aria-disabled": _ariaDisabledAttr,
    dataDisabled: _dataDisabled,
    "data-disabled": _dataDisabledAttr,
    ...restProps
  } = rawProps;

  const result = {
    ...restProps,
    ...(href !== undefined ? { href } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(tabIndex !== undefined ? { tabIndex } : {}),
    ...(ariaDisabled !== undefined ? { ariaDisabled } : {}),
    ...(dataDisabled !== undefined ? { dataDisabled } : {}),
    ...(onkeydown !== undefined ? { onkeydown } : {}),
    onclick,
  } as SeidrElementProps<K>;

  let handled = existingHandled;
  if (!handled) {
    handled = new WeakSet<object>();
    appState.setData(DATA_KEY_HANDLED_LINK_PROPS, handled);
  }
  handled.add(result);
  return result;
};
