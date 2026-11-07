import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SelectRootProps } from "./types.js";

/**
 * Root container element for a Select component (`role="group"`).
 */
export function SelectRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: SelectRootProps<T> = {} as SelectRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: select,
    role = "group",
    dataComponent = "select",
    id: userId,
    ...rest
  } = props;

  if (!select) {
    throw new SeidrError("SelectRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: userId ?? select.id,
      role,
      dataComponent,
      dataPart: "root",
      dataExpanded: select.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: select.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: select.isDisabled.as((d) => (d ? "" : undefined)),
      dataReadonly: select.isReadOnly.as((r) => (r ? "" : undefined)),
      dataRequired: select.isRequired.as((r) => (r ? "" : undefined)),
      dataValid: select.validationState === "valid" ? "" : undefined,
      dataInvalid: select.validationState === "invalid" ? "" : undefined,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

