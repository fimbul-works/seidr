import { isFn, isObj } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  Portal,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_MENU, DATA_PART_CONTENT } from "../constants.js";
import { PopperPositioner } from "../popper/popper-positioner.js";
import type { MenuContentProps } from "./types.js";

/**
 * Floating content container element for a Menu dropdown (role="menu").
 */
export function MenuContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: MenuContentProps<T> = {} as MenuContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: menu,
    dataComponent = DATA_COMPONENT_MENU,
    items,
    renderList,
    portalTarget,
    id: userId,
    ref: userRef,
    style: userStyle,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    onkeydown: userOnKeyDown,
    ...rest
  } = props;

  if (!menu) {
    throw new SeidrError("MenuContent requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    menu.contentRef(el as unknown as HTMLElement);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      menu.handleContentKeyDown(e);
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
        id: userId ?? menu.contentId,
        ref: internalRef,
        role: "menu",
        tabIndex: -1,
        "aria-labelledby": ariaLabelledBy ?? menu.triggerId,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        dataComponent,
        dataPart: DATA_PART_CONTENT,
        dataExpanded: menu.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: menu.isOpen.as((o) => (!o ? "" : undefined)),
        style: combinedStyle,
        onkeydown: handleKeyDown,
        ...rest,
      } as SeidrElementProps<T>,
      items !== undefined && renderList !== undefined
        ? [renderList(items), ...(children !== undefined ? (Array.isArray(children) ? children : [children]) : [])]
        : children,
    );

    return PopperPositioner<"div">(
      {
        instance: menu.popper,
        dataComponent,
      },
      contentEl,
    ) as unknown as SeidrElementTagNameMap[T];
  };

  const renderMaybePortaled = (): SeidrElementTagNameMap[T] => {
    const target = portalTarget ?? menu.portalTarget;
    if (target) {
      return Portal(target, renderContent, "MenuPortal") as unknown as SeidrElementTagNameMap[T];
    }
    return renderContent();
  };

  if (menu.forceMount) {
    return wrapValue(renderMaybePortaled()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return Show(menu.isOpen, renderMaybePortaled) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
