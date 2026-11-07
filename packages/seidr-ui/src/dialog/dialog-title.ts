import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { DialogTitleProps } from "./types.js";

/**
 * Accessible title heading for the Dialog.
 */
export function DialogTitle<T extends keyof SeidrElementTagNameMap = "h2">(
  props: DialogTitleProps<T> = {} as DialogTitleProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "h2" as T, instance: dialog, dataComponent = "dialog", ...rest } = props;

  if (!dialog) {
    throw new SeidrError("DialogTitle requires an instance coordinator");
  }

  return $(
    as,
    {
      id: dialog.titleId,
      dataComponent,
      dataPart: "title",
      dataExpanded: dialog.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: dialog.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

