import { type DerivedValue, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import type { UseSwitchResult } from "./types.js";

export type SwitchErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlErrorMessageProps<T> & { instance?: UseSwitchResult };

/**
 * SwitchErrorMessage component.
 */
export function SwitchErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props: SwitchErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { instance: sw, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchErrorMessage requires an instance coordinator");
  }

  return FormControlErrorMessage(
    {
      instance: sw.formControl,
      ...sw.dataset,
      dataComponent: "switch",
      ...rest,
    } as FormControlErrorMessageProps<T>,
    children,
  );
}
