import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_NAVIGATION_MENU, DATA_PART_VIEWPORT } from "../constants.js";
import type { NavigationMenuViewportProps } from "./types.js";

/**
 * Shared viewport container for NavigationMenu content.
 */
export function NavigationMenuViewport<T extends keyof SeidrElementTagNameMap = "div">(
  props: NavigationMenuViewportProps<T> = {} as NavigationMenuViewportProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = DATA_COMPONENT_NAVIGATION_MENU,
    ref: userRef,
    children: propsChildren,
    ...rest
  } = props;

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    instance?.viewportRef(el as unknown as HTMLElement);
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
      ref: internalRef,
      dataOrientation: instance?.orientation,
      dataState: instance?.isOpen.as((o) => (o ? "open" : "closed")),
      dataExpanded: instance?.isOpen.as((o) => (o ? "" : undefined)),
      dataComponent,
      dataPart: DATA_PART_VIEWPORT,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
