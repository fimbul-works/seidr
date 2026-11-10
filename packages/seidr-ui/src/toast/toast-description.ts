import {
  $,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_PART_DESCRIPTION } from "../constants.js";
import type { ToastDescriptionProps } from "./types.js";

/**
 * Optional accessible description (`data-part="description"`) announced when the toast opens.
 */
export function ToastDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: ToastDescriptionProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: toast, id: customId, dataComponent, ...rest } = props;

  if (!toast) {
    throw new SeidrError("ToastDescription requires a Toast instance coordinator");
  }

  const descriptionId = customId ?? toast.generateId("description");
  const unregister = toast.registerDescriptionId(descriptionId);
  onUnmounted(unregister);

  return $<T>(
    as,
    {
      id: descriptionId,
      dataComponent: dataComponent ?? toast.dataComponent,
      dataPart: DATA_PART_DESCRIPTION,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
