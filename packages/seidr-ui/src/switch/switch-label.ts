import { type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseSwitchResult } from "./types.js";

export type SwitchLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = FormControlLabelProps<T> & {
  instance?: UseSwitchResult;
};

/**
 * SwitchLabel component.
 */
export function SwitchLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: SwitchLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: sw, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchLabel requires an instance prop");
  }

  return FormControlLabel(
    {
      instance: sw.formControl,
      ...sw.dataset,
      dataComponent: "switch",
      ...rest,
    } as FormControlLabelProps<T>,
    children,
  );
}
