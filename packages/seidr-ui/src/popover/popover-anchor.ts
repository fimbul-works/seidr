import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { PopoverAnchorProps } from "./types.js";

/**
 * An optional element to position the PopoverContent against instead of the trigger.
 */
export function PopoverAnchor<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopoverAnchorProps<T> = {} as PopoverAnchorProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: popover,
    dataComponent = "popover",
    ref: userRef,
    ...rest
  } = props;

  if (!popover) {
    throw new SeidrError("PopoverAnchor requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    popover.anchorRef(el as unknown as HTMLElement);
  });

  return $(
    as,
    {
      ref: internalRef,
      dataComponent,
      dataPart: "anchor",
      dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

