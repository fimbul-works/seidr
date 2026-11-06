import { isFn, isFunction } from "@fimbul-works/hvat";
import { assignProp } from "../element/assign-prop.js";
import type { SeidrElementProps, SeidrElementTagNameMap } from "../element/types.js";
import { unwrapValue, wrapValue } from "../index.core.js";
import { isValue } from "../observable/type-guards.js";
import { mergeValues } from "../observable/value.js";
import { isClient } from "../util/environment/is-client.js";
import { navigate } from "./navigate.js";

/**
 * Handle link element props.
 *
 * @template {keyof SeidrElementTagNameMap} K - Element tag name type
 * @template {SeidrElementTagNameMap[K]} E - Element type
 * @param {E} link - Element to assign properties to
 * @param {SeidrElementProps<K>} props - Properties to assign
 */
export const handleLinkProps = <
  K extends keyof SeidrElementTagNameMap = "a",
  E extends SeidrElementTagNameMap[K] = SeidrElementTagNameMap[K],
>(
  link: E,
  props: SeidrElementProps<K>,
): SeidrElementProps<K> => {
  // Ensure there's a link to click to
  const { href: originalHref, disabled: originalDisabled, onclick: originalOnClick } = props as any;
  if (!isValue(originalHref) && !originalHref) {
    return props;
  }

  // Wrap values
  const isLinkTag = link.tagName.toLowerCase() === "a";
  const wrappedHref = wrapValue(originalHref as string);
  const wrappedDisabled = wrapValue((originalDisabled as boolean) ?? false);

  // Figure out the URL
  const baseUrl = isClient() ? window.location.href : "http://localhost";
  const url = mergeValues<URL>(
    () => (URL.canParse(wrappedHref()) ? URL.parse(wrappedHref()) : URL.parse(wrappedHref(), baseUrl)) as URL,
    {
      parents: [wrappedHref, wrappedDisabled],
    })
  const href = url.as(url => !url.href.startsWith(baseUrl) ? url.href : url.href.substring(baseUrl.length))
  const isExternal = href.as(href => !href.startsWith(baseUrl))

  // External links are not overridden
  if (isExternal()) {
    return props
  }

  // Determine role & tabIndex
  const role = wrappedDisabled.as(disabled => !isLinkTag || disabled ? "link" : undefined)
  const tabIndex = wrappedDisabled.as(disabled => !isLinkTag && !disabled ? 0 : undefined)

  // Disabled status
  const ariaDisabled = wrappedDisabled.as(disabled => disabled ? true : undefined)
  const dataDisabled = wrappedDisabled.as(disabled => disabled ? "" : undefined)

  const onclick = (event: MouseEvent) => {
    if (wrappedDisabled()) {
      event.preventDefault();
      return;
    }
    if (navigate(href())) {
        event.preventDefault();
    }
  }

  console.log("LINK PROP", { role, href, ariaDisabled, dataDisabled });

  return props;
  return { ...props, role, tabIndex, href, ariaDisabled, dataDisabled, onclick }
};
