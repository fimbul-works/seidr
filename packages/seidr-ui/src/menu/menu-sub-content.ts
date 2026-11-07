import { isFn, isObj } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import { PopperPositioner } from "../popper/popper-positioner.js";
import type { MenuSubContentProps } from "./types.js";

/**
 * Floating submenu content panel (role="menu").
 */
export function MenuSubContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuSubContentProps<T> = {} as MenuSubContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: menu,
    subInstance,
    dataComponent = "menu",
    id: userId,
    ref: userRef,
    style: userStyle,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    onkeydown: userOnKeyDown,
    ...rest
  } = props;

  const targetSub = subInstance ?? menu;

  if (!targetSub) {
    throw new SeidrError("MenuSubContent requires a subInstance or menu coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    targetSub.contentRef(el as unknown as HTMLElement);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      targetSub.handleContentKeyDown(e);
    }
  };

  const renderContent = (): SeidrElementTagNameMap[T] => {
    const baseStyle: Record<string, string | number> = {
      position: "relative",
    };
    const combinedStyle = isObj(userStyle) ? { ...baseStyle, ...userStyle } : baseStyle;

    const contentEl = $(
      as,
      {
        id: userId ?? targetSub.contentId,
        ref: internalRef,
        role: "menu",
        tabIndex: -1,
        "aria-labelledby": ariaLabelledBy ?? targetSub.triggerId,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        dataComponent,
        dataPart: "sub-content",
        dataExpanded: targetSub.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: targetSub.isOpen.as((o) => (!o ? "" : undefined)),
        style: combinedStyle,
        onkeydown: handleKeyDown,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

    return PopperPositioner<"div">(
      {
        instance: targetSub.popper,
        dataComponent,
      },
      contentEl,
    ) as unknown as SeidrElementTagNameMap[T];
  };

  if (targetSub.forceMount) {
    return wrapValue(renderContent()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return Show(
    targetSub.isOpen,
    () => renderContent(),
  ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}

