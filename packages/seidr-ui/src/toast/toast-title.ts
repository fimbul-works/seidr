import {
  $,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_PART_TITLE } from "../constants.js";
import type { ToastTitleProps } from "./types.js";

/**
 * Accessible title element (`data-part="title"`) announced when the toast opens.
 */
export function ToastTitle<T extends keyof SeidrElementTagNameMap = "div">(
  props: ToastTitleProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: toast, id: customId, dataComponent, ...rest } = props;

  if (!toast) {
    throw new SeidrError("ToastTitle requires a Toast instance coordinator");
  }

  const titleId = customId ?? toast.generateId("title");
  const unregister = toast.registerTitleId(titleId);
  onUnmounted(unregister);

  return $<T>(
    as,
    {
      id: titleId,
      dataComponent: dataComponent ?? toast.dataComponent,
      dataPart: DATA_PART_TITLE,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
