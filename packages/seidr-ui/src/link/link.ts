import { isNullish, isTruthy, isUndef } from "@fimbul-works/hvat";
import {
  $,
  type DerivedValue,
  handleLinkProps,
  isObservable,
  isUrlActive,
  type LinkElementProps,
  mergeValues,
  type Observable,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementTagNameMap,
  unwrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_LINK } from "../constants.js";
import type { LinkProps } from "./types.js";

/**
 * Link component enables users to navigate to another page or resource while maintaining
 * compliance with WAI-ARIA guidelines.
 *
 * Automatically coordinates with Seidr's centralized navigation system,
 * supports active states (`data-current`, `aria-current`, `activeClass`),
 * and polymorphic elements (`as="span"`, `as="button"`, etc.).
 */
export function Link<T extends keyof SeidrElementTagNameMap = "a">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Link<T extends keyof SeidrElementTagNameMap = "a">(
  props: LinkProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Link<T extends keyof SeidrElementTagNameMap = "a">(
  propsOrChildren?: LinkProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<LinkProps<T>>(propsOrChildren, children);
  const {
    href,
    as = "a" as T,
    disabled,
    exact,
    className: rawClassName,
    activeClass: activeClassName,
    inactiveClass: inactiveClassName,
    ariaCurrent = "page",
    ...restProps
  } = props;

  const isActive = isNullish(href) ? undefined : isUrlActive(href, { exact });

  // Class name resolution based on active/inactive states
  const hasDynamicClass = !isUndef(activeClassName) || !isUndef(inactiveClassName);
  const classNameParents = [isActive, activeClassName, inactiveClassName, rawClassName].filter(isObservable);

  let className = rawClassName;
  if (hasDynamicClass) {
    if (classNameParents.length > 0) {
      className = mergeValues(
        () => {
          const classes = [
            unwrapValue(rawClassName),
            isActive?.() ? unwrapValue(activeClassName) : unwrapValue(inactiveClassName),
          ].filter(isTruthy);
          return classes.length > 0 ? classes.join(" ") : undefined;
        },
        { parents: classNameParents },
      );
    } else {
      const classes = [unwrapValue(rawClassName), unwrapValue(inactiveClassName)].filter(isTruthy);
      className = classes.length > 0 ? classes.join(" ") : undefined;
    }
  }

  // ARIA current attribute resolution when active
  let resolvedARIACurrent: DerivedValue<string | undefined> | undefined;
  if (isActive) {
    const ariaCurrentParents = [isActive, ariaCurrent].filter(isObservable) as Observable[];
    resolvedARIACurrent = mergeValues(
      () => {
        if (!isActive()) {
          return undefined;
        }
        const val = unwrapValue(ariaCurrent);
        return val === false ? undefined : val === true || isNullish(val) ? "page" : val;
      },
      { parents: ariaCurrentParents },
    );
  }

  const dataCurrent = isActive?.as((a) => (a ? "" : undefined));

  const processedProps = handleLinkProps(as, {
    dataComponent: DATA_COMPONENT_LINK,
    ...restProps,
    ...(dataCurrent !== undefined ? { dataCurrent } : {}),
    ...(href !== undefined ? { href } : {}),
    ...(disabled !== undefined ? { disabled } : {}),
    ...(className !== undefined ? { className } : {}),
    ...(resolvedARIACurrent !== undefined ? { ariaCurrent: resolvedARIACurrent } : {}),
  } as LinkElementProps<T>);

  return $(as, processedProps, content);
}
