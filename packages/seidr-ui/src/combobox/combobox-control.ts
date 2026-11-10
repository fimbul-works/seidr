import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_COMBOBOX, DATA_PART_CONTROL } from "../constants.js";
import type { ComboboxControlProps } from "./types.js";

/**
 * Control container grouping the input and trigger button.
 */
export function ComboboxControl<T extends keyof SeidrElementTagNameMap = "div">(
  props: ComboboxControlProps<T> = {} as ComboboxControlProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: combobox,
    dataComponent = DATA_COMPONENT_COMBOBOX,
    id: customId,
    ref: userRef,
    ...rest
  } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxControl requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    combobox.controlRef(el as unknown as HTMLElement);
  });

  return $(
    as,
    {
      ref: internalRef,
      id: customId ?? combobox.controlId,
      dataComponent,
      dataPart: DATA_PART_CONTROL,
      dataExpanded: combobox.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: combobox.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: combobox.isDisabled.as((d) => (d ? "" : undefined)),
      dataReadonly: combobox.isReadOnly.as((r) => (r ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
