import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseSwitchResult } from "./types.js";

export type SwitchDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlDescriptionProps<T> & {
    instance?: UseSwitchResult;
  };

/**
 * SwitchDescription standalone component.
 */
export function SwitchDescription<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: SwitchDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchDescription<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SwitchDescriptionProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
  const { instance: sw, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchDescription requires an instance prop");
  }

  return FormControlDescription(
    { instance: sw.formControl, ...sw.dataset, ...rest } as FormControlDescriptionProps<T>,
    content,
  );
}
