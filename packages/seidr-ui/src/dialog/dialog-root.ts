import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { DialogRootProps } from "./types.js";

/**
 * Root container for fine-grained Dialog composition.
 */
export function DialogRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: DialogRootProps<T> = {} as DialogRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: dialog, dataComponent = "dialog", ...rest } = props;

  if (!dialog) {
    throw new SeidrError("DialogRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: dialog.id,
      dataComponent,
      dataPart: "root",
      dataExpanded: dialog.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: dialog.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

