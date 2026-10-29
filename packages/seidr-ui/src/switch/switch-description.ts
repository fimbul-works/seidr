import { type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseSwitchResult } from "./types.js";

export type SwitchDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> = FormControlDescriptionProps<T> & {
  instance?: UseSwitchResult;
};

/**
 * SwitchDescription component.
 */
export function SwitchDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: SwitchDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: sw, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchDescription requires an instance coordinator");
  }

  return FormControlDescription(
    { instance: sw.formControl, ...sw.dataset, dataComponent: "switch", ...rest } as FormControlDescriptionProps<T>,
    children,
  );
}
