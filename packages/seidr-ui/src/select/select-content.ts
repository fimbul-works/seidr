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
import { DATA_COMPONENT_SELECT, DATA_PART_CONTENT } from "../constants.js";
import { PopperPositioner } from "../popper/popper-positioner.js";
import type { SelectContentProps } from "./types.js";

/**
 * Floating content container element for a Select dropdown.
 */
export function SelectContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: SelectContentProps<T> = {} as SelectContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: select,
    dataComponent = DATA_COMPONENT_SELECT,
    portalTarget,
    ref: userRef,
    style: userStyle,
    ...rest
  } = props;

  if (!select) {
    throw new SeidrError("SelectContent requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    select.contentRef(el as unknown as HTMLElement);
  });

  const renderContent = (): SeidrElementTagNameMap[T] => {
    const baseStyle: Record<string, string | number> = {
      position: "relative",
    };
    const combinedStyle = isObj(userStyle) ? { ...baseStyle, ...userStyle } : baseStyle;

    const contentEl = $(
      as,
      {
        ref: internalRef,
        dataComponent,
        dataPart: DATA_PART_CONTENT,
        dataExpanded: select.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: select.isOpen.as((o) => (!o ? "" : undefined)),
        style: combinedStyle,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

    return PopperPositioner<"div">(
      {
        instance: select.popper,
        dataComponent,
      },
      contentEl,
    ) as unknown as SeidrElementTagNameMap[T];
  };

  const renderMaybePortaled = (): SeidrElementTagNameMap[T] => {
    const target = portalTarget ?? select.portalTarget;
    if (target) {
      return Portal(target, renderContent, "SelectPortal") as unknown as SeidrElementTagNameMap[T];
    }
    return renderContent();
  };

  if (select.forceMount) {
    return wrapValue(renderMaybePortaled()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return Show(select.isOpen, renderMaybePortaled) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
