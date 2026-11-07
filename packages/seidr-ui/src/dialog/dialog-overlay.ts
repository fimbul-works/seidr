import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
} from "@fimbul-works/seidr";
import type { DialogOverlayProps } from "./types.js";

/**
 * Backdrop overlay that covers the viewport behind the active Dialog.
 */
export function DialogOverlay<T extends keyof SeidrElementTagNameMap = "div">(
  props: DialogOverlayProps<T> = {} as DialogOverlayProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: dialog,
    dataComponent = "dialog",
    ref: userRef,
    onpointerdown: userOnPointerDown,
    ...rest
  } = props;

  if (!dialog) {
    throw new SeidrError("DialogOverlay requires an instance coordinator");
  }

  const renderOverlay = (): SeidrElementTagNameMap[T] => {
    const internalRef = createRef<SeidrElementTagNameMap[T]>();

    internalRef.bind((el) => {
      if (userRef && el && isFn(userRef)) {
        Reflect.apply(userRef, null, [el]);
      }
      dialog.overlayRef(el as unknown as HTMLElement);
    });

    const handlePointerDown = (e: PointerEvent) => {
      if (userOnPointerDown && isFn(userOnPointerDown)) {
        Reflect.apply(userOnPointerDown, null, [e]);
      }
      if (e.target === e.currentTarget) {
        // Prevent accidental text selection when clicking overlay
        e.preventDefault();
      }
    };

    return $(
      as,
      {
        ref: internalRef,
        "aria-hidden": "true",
        dataComponent,
        dataPart: "overlay",
        dataExpanded: dialog.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: dialog.isOpen.as((o) => (!o ? "" : undefined)),
        onpointerdown: handlePointerDown,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );
  };

  return Show(dialog.isOpen, renderOverlay) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}

