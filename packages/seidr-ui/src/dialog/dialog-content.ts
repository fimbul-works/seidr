import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  Portal,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
} from "@fimbul-works/seidr";
import { useEscapeKeyDown } from "../hooks/use-escape-keydown.js";
import { useFocusScope } from "../hooks/use-focus-scope.js";
import { useHideOutside } from "../hooks/use-hide-outside.js";
import { useInteractOutside } from "../hooks/use-interact-outside.js";
import { usePreventScroll } from "../hooks/use-prevent-scroll.js";
import { contains } from "../utils/dom.js";
import type { DialogContentProps } from "./types.js";

/**
 * Main content container for Dialog that renders when open.
 */
export function DialogContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: DialogContentProps<T> = {} as DialogContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: dialog,
    dataComponent = "dialog",
    role = "dialog",
    portalTarget,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ref: userRef,
    ...rest
  } = props;

  if (!dialog) {
    throw new SeidrError("DialogContent requires an instance coordinator");
  }

  const isClosed = dialog.isOpen.as((o) => !o);

  useEscapeKeyDown({
    isDisabled: isClosed,
    onEscapeKeyDown: (event) => {
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) {
        dialog.close();
      }
    },
  });

  useInteractOutside(dialog.contentRef, {
    isDisabled: isClosed,
    shouldExcludeElement: (element) => contains(dialog.triggerRef() ?? undefined, element),
    onPointerDownOutside: (event) => {
      onPointerDownOutside?.(event);
      if (!event.defaultPrevented && dialog.closeOnOutsideClick) {
        dialog.close();
      }
    },
    onFocusOutside,
    onInteractOutside,
  });

  useFocusScope(
    dialog.contentRef,
    {
      trapFocus: dialog.isModal,
      onMountAutoFocus: onOpenAutoFocus,
      onUnmountAutoFocus: (event) => {
        onCloseAutoFocus?.(event);
        if (!event.defaultPrevented) {
          const trigger = dialog.triggerRef();
          if (trigger) {
            trigger.focus();
          }
        }
      },
    },
  );

  useHideOutside({
    isDisabled: dialog.isOpen.as((o) => !o || !dialog.isModal()),
    targets: dialog.contentRef,
  });

  usePreventScroll({
    isDisabled: dialog.isOpen.as((o) => !o || !dialog.preventScroll()),
  });

  const renderContent = (): SeidrElementTagNameMap[T] => {
    const internalRef = createRef<SeidrElementTagNameMap[T]>();

    internalRef.bind((el) => {
      if (userRef && el && isFn(userRef)) {
        Reflect.apply(userRef, null, [el]);
      }
      dialog.contentRef(el as unknown as HTMLElement);
    });

    return $(
      as,
      {
        ref: internalRef,
        role,
        id: dialog.contentId,
        tabIndex: -1,
        "aria-modal": dialog.isModal.as((m) => (m ? "true" : undefined)),
        "aria-labelledby": ariaLabelledBy ?? dialog.titleId,
        "aria-describedby": ariaDescribedBy ?? dialog.descriptionId,
        "aria-label": ariaLabel,
        dataComponent,
        dataPart: "content",
        dataExpanded: dialog.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: dialog.isOpen.as((o) => (!o ? "" : undefined)),
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );
  };

  const renderMaybePortaled = (): SeidrElementTagNameMap[T] => {
    const target = portalTarget ?? dialog.portalTarget;
    if (target) {
      return Portal(target, renderContent, "DialogPortal") as unknown as SeidrElementTagNameMap[T];
    }
    return renderContent();
  };

  return Show(dialog.isOpen, renderMaybePortaled) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
