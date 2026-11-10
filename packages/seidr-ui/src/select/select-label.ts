import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SELECT, DATA_PART_LABEL } from "../constants.js";
import type { SelectLabelProps } from "./types.js";

/**
 * Accessible label element for a Select component.
 */
export function SelectLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: SelectLabelProps<T> = {} as SelectLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance: select,
    dataComponent = DATA_COMPONENT_SELECT,
    id: userId,
    onclick: userOnClick,
    ...rest
  } = props;

  if (!select) {
    throw new SeidrError("SelectLabel requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    if (typeof userOnClick === "function") {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented && !select.isDisabled()) {
      select.triggerRef()?.focus();
    }
  };

  return $(
    as,
    {
      id: userId ?? select.labelId,
      dataComponent,
      dataPart: DATA_PART_LABEL,
      dataDisabled: select.isDisabled.as((d) => (d ? "" : undefined)),
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
