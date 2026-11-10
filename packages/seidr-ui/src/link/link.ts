import { isTruthy, isUndef } from "@fimbul-works/hvat";
import {
  $,
  isObservable,
  isUrlActive,
  mergeValues,
  type Observable,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  unwrapValue,
  wrapValue,
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
    onkeydown: userOnKeyDown,
    ...restProps
  } = props;

  const isCustomElement = as !== "a";
  const wrappedHref = wrapValue(href);
  const isActive = isUrlActive(wrappedHref, { exact });

  // Class name resolution based on active/inactive states
  const hasDynamicClass = !isUndef(activeClassName) || !isUndef(inactiveClassName);
  const classNameParents = [isActive, activeClassName, inactiveClassName, rawClassName].filter(isObservable);

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

  // ARIA current attribute resolution when active
  const ariaCurrentParents = [isActive, ariaCurrent].filter(isObservable) as Observable[];
  const resolvedAriaCurrent = mergeValues(
    () => {
      if (!isActive()) {
        return undefined;
      }
      const val = unwrapValue(ariaCurrent);
      return val === false ? undefined : val === true || isUndef(val) ? "page" : val;
    },
    { parents: ariaCurrentParents },
  );

  // Keydown handler for custom non-anchor elements
  const onkeydown = isCustomElement
    ? (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).click();
        }
        (userOnKeyDown as any)?.(e);
      }
    : userOnKeyDown;

  return $(
    as,
    {
      dataComponent: DATA_COMPONENT_LINK,
      dataCurrent: isActive.as((a) => (a ? "" : undefined)),
      ...restProps,
      href: wrappedHref,
      disabled,
      className,
      ariaCurrent: resolvedAriaCurrent,
      onkeydown,
    } as unknown as SeidrElementProps<T>,
    content,
  );
}
