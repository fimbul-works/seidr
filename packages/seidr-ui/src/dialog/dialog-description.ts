import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_DIALOG, DATA_PART_DESCRIPTION } from "../constants.js";
import type { DialogDescriptionProps } from "./types.js";

/**
 * Accessible description paragraph for the Dialog.
 */
export function DialogDescription<T extends keyof SeidrElementTagNameMap = "p">(
  props: DialogDescriptionProps<T> = {} as DialogDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "p" as T, instance: dialog, dataComponent = DATA_COMPONENT_DIALOG, ...rest } = props;

  if (!dialog) {
    throw new SeidrError("DialogDescription requires an instance coordinator");
  }

  return $(
    as,
    {
      id: dialog.descriptionId,
      dataComponent,
      dataPart: DATA_PART_DESCRIPTION,
      dataExpanded: dialog.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: dialog.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
