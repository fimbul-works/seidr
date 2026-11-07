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
import type { ComboboxContentProps } from "./types.js";

/**
 * Dropdown overlay container for Combobox listbox content.
 */
export function ComboboxContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: ComboboxContentProps<T> = {} as ComboboxContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: combobox,
    dataComponent = "combobox",
    ref: userRef,
    style: userStyle,
    ...rest
  } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxContent requires an instance coordinator");
  }

  const renderContent = (): SeidrElementTagNameMap[T] => {
    const internalRef = createRef<SeidrElementTagNameMap[T]>();

    internalRef.bind((el) => {
      if (userRef && el && isFn(userRef)) {
        Reflect.apply(userRef, null, [el]);
      }
      combobox.contentRef(el as unknown as HTMLElement);
    });

    const baseStyle: Record<string, string | number> = {
      outline: "none",
    };

    const combinedStyle = isObj(userStyle) ? { ...baseStyle, ...userStyle } : baseStyle;

    const contentEl = $(
      as,
      {
        ref: internalRef,
        dataComponent,
        dataPart: "content",
        dataExpanded: combobox.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: combobox.isOpen.as((o) => (!o ? "" : undefined)),
        style: combinedStyle,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

    return PopperPositioner<"div">(
      {
        instance: combobox.popper,
        dataComponent,
      },
      contentEl,
    ) as unknown as SeidrElementTagNameMap[T];
  };

  if (combobox.forceMount) {
    return wrapValue(renderContent()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return Show(combobox.isOpen, renderContent) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}

