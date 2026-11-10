import {
  $,
  mergeValues,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_NUMBER_FIELD, DATA_PART_DECREMENT_TRIGGER } from "../constants.js";
import type { UseNumberFieldResult } from "./types.js";

export interface NumberFieldDecrementTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  /**
   * The HTML element tag name to render.
   * @default "button"
   */
  as?: T;

  /**
   * Explicit number field coordinator instance providing reactive state.
   */
  instance?: UseNumberFieldResult;

  /** TabIndex for keyboard focus. Defaults to -1. */
  tabIndex?: number;

  dataComponent?: string;
  dataPart?: string;
  onclick?: (e: MouseEvent) => void;
}

export type NumberFieldDecrementTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> =
  NumberFieldDecrementTriggerOptions<T> & SeidrElementProps<T>;

/**
 * NumberFieldDecrementTrigger is a button that decrements the numeric field value by step.
 */
export function NumberFieldDecrementTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: NumberFieldDecrementTriggerProps<T> = {} as NumberFieldDecrementTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "button" as T, instance: nf, tabIndex = -1, onclick, ...rest } = props;

  if (!nf) {
    throw new SeidrError("NumberFieldDecrementTrigger requires an instance coordinator");
  }

  const isDisabled = mergeValues(
    () => nf.formControl.isDisabled() || (!Number.isNaN(nf.rawValue()) && nf.rawValue() <= nf.minValue),
    { parents: [nf.formControl.isDisabled, nf.rawValue] },
  );

  const handleClick = (e: MouseEvent) => {
    (onclick as (ev: MouseEvent) => void)?.(e);
    if (e.defaultPrevented) return;
    nf.varyValue(-nf.step);
    nf.inputRef()?.focus({ preventScroll: true });
  };

  return $(
    as,
    {
      type: as === "button" ? "button" : undefined,
      tabIndex,
      disabled: isDisabled,
      "aria-controls": nf.formControl.fieldId,
      "data-disabled": isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: DATA_COMPONENT_NUMBER_FIELD,
      dataPart: DATA_PART_DECREMENT_TRIGGER,
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    children ?? "−",
  );
}
