import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_NAVIGATION_MENU, DATA_PART_ROOT } from "../constants.js";
import type { NavigationMenuRootProps } from "./types.js";

/**
 * NavigationMenu root container factory (typically renders a <nav> landmark).
 */
export function NavigationMenuRoot<T extends keyof SeidrElementTagNameMap = "nav">(
  props: NavigationMenuRootProps<T> = {} as NavigationMenuRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "nav" as T,
    instance,
    dataComponent = DATA_COMPONENT_NAVIGATION_MENU,
    ref: userRef,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("NavigationMenuRoot requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      instance.rootRef(el as HTMLElement);
    }
  });

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
      id: instance.id,
      ref: internalRef,
      dataOrientation: instance.orientation,
      dataComponent,
      dataPart: DATA_PART_ROOT,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
