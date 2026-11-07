import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { MenubarRootProps } from "./types.js";

/**
 * Top-level root container for the Menubar system (role="menubar").
 */
export function MenubarRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenubarRootProps<T> = {} as MenubarRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = "menubar",
    ref: userRef,
    onkeydown: userOnKeyDown,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("MenubarRoot requires an instance coordinator");
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      instance.handleRootKeyDown(e);
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
      id: instance.id,
      ref: internalRef,
      role: "menubar",
      "aria-orientation": instance.orientation,
      dataOrientation: instance.orientation,
      dataComponent,
      dataPart: "root",
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

