import {
  $,
  isObservable,
  mergeValues,
  navigate,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  unwrapValue,
  wrapValue,
} from "@fimbul-works/seidr";
import type { BreadcrumbsLinkProps } from "./types.js";

/**
 * An accessible breadcrumb link representing an ancestor or the current page.
 */
export function BreadcrumbsLink<T extends keyof SeidrElementTagNameMap = "a">(
  propsOrChildren?: BreadcrumbsLinkProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<BreadcrumbsLinkProps<T>>(propsOrChildren, children);
  const {
    as = "a" as T,
    href,
    current = false,
    disabled = false,
    ariaCurrent = "page",
    role: customRole,
    tabIndex: customTabIndex,
    instance,
    dataComponent,
    dataPart,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("BreadcrumbsLink requires an instance coordinator");
  }

  const currentVal = wrapValue(current);
  const disabledVal = wrapValue(disabled);

  const isEffectivelyDisabled = mergeValues(() => currentVal() || disabledVal(), {
    parents: [currentVal, disabledVal],
  });

  const resolvedAriaCurrent = mergeValues(
    () => {
      if (!currentVal()) return undefined;
      const custom = unwrapValue(ariaCurrent);
      return custom ?? "page";
    },
    {
      parents: [currentVal, ariaCurrent].filter(isObservable),
    },
  );

  const dataCurrent = currentVal.as((c) => (c ? "" : undefined));
  const ariaDisabled = isEffectivelyDisabled.as((d) => (d ? "true" : undefined));
  const dataDisabled = isEffectivelyDisabled.as((d) => (d ? "" : undefined));

  const isCustom = as !== "a";
  const role = isCustom ? (customRole ?? "link") : customRole;
  const tabIndex = isCustom ? (customTabIndex ?? isEffectivelyDisabled.as((d) => (d ? undefined : 0))) : customTabIndex;

  const onclick = (e: MouseEvent) => {
    if (isEffectivelyDisabled()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    if (userOnClick) {
      (userOnClick as (ev: MouseEvent) => void)(e);
      if (e.defaultPrevented) return;
    }

    // Pass through modifier keys or non-primary clicks (middle-click, new tab, etc.)
    if (e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    const targetHref = unwrapValue(href);
    if (targetHref) {
      const handled = navigate(targetHref);
      if (handled) {
        e.preventDefault();
        return;
      }
    }
  };

  const onkeydown = (e: KeyboardEvent) => {
    if (isCustom && e.key === "Enter") {
      if (isEffectivelyDisabled()) {
        e.preventDefault();
        return;
      }
      (e.currentTarget as HTMLElement).click();
    }
    if (userOnKeyDown) {
      (userOnKeyDown as (ev: KeyboardEvent) => void)(e);
    }
  };

  const resolvedHref = isEffectivelyDisabled.as((d) => (d ? undefined : unwrapValue(href)));

  return $(
    as,
    {
      dataComponent: dataComponent ?? "breadcrumbs",
      dataPart: dataPart ?? "link",
      role,
      tabIndex,
      href: !isCustom ? resolvedHref : undefined,
      ariaCurrent: resolvedAriaCurrent,
      ariaDisabled,
      dataDisabled,
      dataCurrent,
      onclick,
      onkeydown,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
