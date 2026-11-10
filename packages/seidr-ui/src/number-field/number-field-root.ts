import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_NUMBER_FIELD, DATA_PART_ROOT } from "../constants.js";
import type { UseNumberFieldOptions, UseNumberFieldResult } from "./types.js";

export interface NumberFieldRootOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UseNumberFieldOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit number field coordinator instance providing reactive state.
   */
  instance?: UseNumberFieldResult;
}

export type NumberFieldRootProps<T extends keyof SeidrElementTagNameMap = "div"> = NumberFieldRootOptions<T> &
  SeidrElementProps<T>;

/**
 * NumberFieldRoot is the outer container for a number field (role="group").
 */
export function NumberFieldRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: NumberFieldRootProps<T> = {} as NumberFieldRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: nf, id, ...rest } = props;

  if (!nf) {
    throw new SeidrError("NumberFieldRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      role: "group",
      id: id ?? nf.formControl.id,
      ref: nf.rootRef,
      ...nf.dataset,
      dataComponent: DATA_COMPONENT_NUMBER_FIELD,
      dataPart: DATA_PART_ROOT,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
