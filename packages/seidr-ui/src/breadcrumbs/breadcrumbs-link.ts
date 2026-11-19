import {
  $,
  type DerivedValue,
  handleLinkProps,
  isObservable,
  isValue,
  type LinkElementProps,
  mergeValues,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
  unwrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_BREADCRUMBS, DATA_PART_LINK } from "../constants.js";
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
    dataComponent = DATA_COMPONENT_BREADCRUMBS,
    dataPart = DATA_PART_LINK,
    instance,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("BreadcrumbsLink requires an instance coordinator");
  }

  const currentObs = isValue<boolean | undefined>(current) ? current : undefined;
  const disabledObs = isValue<boolean | undefined>(disabled) ? disabled : undefined;
  const isCurrentStatic = !currentObs && Boolean(current);
  const isDisabledStatic = !disabledObs && Boolean(disabled);

  let isEffectivelyDisabled: boolean | DerivedValue<boolean>;
  if (currentObs && disabledObs) {
    isEffectivelyDisabled = mergeValues(() => Boolean(currentObs()) || Boolean(disabledObs()), {
      parents: [currentObs, disabledObs],
    });
  } else if (currentObs) {
    isEffectivelyDisabled = isDisabledStatic ? true : currentObs.as((c) => Boolean(c));
  } else if (disabledObs) {
    isEffectivelyDisabled = isCurrentStatic ? true : disabledObs.as((d) => Boolean(d));
  } else {
    isEffectivelyDisabled = isCurrentStatic || isDisabledStatic;
  }

  const dataCurrent = currentObs ? currentObs.as((c) => (c ? "" : undefined)) : isCurrentStatic ? "" : undefined;

  const ariaCurrentObs = isValue<string | undefined>(ariaCurrent) ? ariaCurrent : undefined;
  let resolvedAriaCurrent: string | DerivedValue<string | undefined> | undefined;
  if (currentObs || (isCurrentStatic && ariaCurrentObs)) {
    resolvedAriaCurrent = mergeValues(
      () => (!unwrapValue(current) ? undefined : (unwrapValue(ariaCurrent) ?? "page")),
      {
        parents: [currentObs, ariaCurrentObs].filter(isObservable),
      },
    );
  } else {
    resolvedAriaCurrent = isCurrentStatic ? (unwrapValue(ariaCurrent) ?? "page") : undefined;
  }

  const processedProps = handleLinkProps(as, {
    dataComponent,
    dataPart,
    ...rest,
    ...(href !== undefined ? { href } : {}),
    ...(isEffectivelyDisabled !== false ? { disabled: isEffectivelyDisabled } : {}),
    ...(customRole !== undefined ? { role: customRole } : {}),
    ...(customTabIndex !== undefined ? { tabIndex: customTabIndex } : {}),
    ...(resolvedAriaCurrent !== undefined ? { ariaCurrent: resolvedAriaCurrent } : {}),
    ...(dataCurrent !== undefined ? { dataCurrent } : {}),
  } as LinkElementProps<T>);

  return $(as, processedProps, content);
}
