import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { NavigationMenuListProps } from "./types.js";

/**
 * NavigationMenu list container factory (renders a <ul> with role="menubar").
 */
export function NavigationMenuList<T extends keyof SeidrElementTagNameMap = "ul">(
  props: NavigationMenuListProps<T> = {} as NavigationMenuListProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "ul" as T,
    instance,
    dataComponent = "navigation-menu",
    ref: userRef,
    onkeydown: userOnKeyDown,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("NavigationMenuList requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      instance.handleListKeyDown(e);
    }
  };

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  return $(
    as,
    {
      ref: internalRef,
      role: "menubar",
      "aria-orientation": instance.orientation,
      dataOrientation: instance.orientation,
      dataComponent,
      dataPart: "list",
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

