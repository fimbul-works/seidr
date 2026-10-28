import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseSwitchResult } from "./types.js";

export type SwitchLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = FormControlLabelProps<T> & {
  instance?: UseSwitchResult;
};

/**
 * SwitchLabel standalone component.
 */
export function SwitchLabel<T extends keyof SeidrElementTagNameMap = "label">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: SwitchLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchLabel<T extends keyof SeidrElementTagNameMap = "label">(
  propsOrChildren?: SwitchLabelProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance: sw, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchLabel requires an instance prop");
  }

  return FormControlLabel({ instance: sw.formControl, ...sw.dataset, ...rest } as FormControlLabelProps<T>, content);
}
