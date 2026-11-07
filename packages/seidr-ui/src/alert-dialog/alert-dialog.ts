import { isArr } from "@fimbul-works/hvat";
import {
  createComponent,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { createAlertDialog } from "./create-alert-dialog.js";
import type { AlertDialogProps } from "./types.js";

export function AlertDialogFactory<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
>(props: AlertDialogProps<TRoot, TTrigger, TContent>): SeidrElementTagNameMap[TRoot] {
  const {
    id,
    defaultOpen,
    open,
    onOpenChange,
    isModal,
    closeOnOutsideClick = false,
    closeOnEscapeKeyDown,
    preventScroll,
    portal = true,
    portalTarget,
    as = "div" as TRoot,
    dataComponent = "alert-dialog",
    trigger,
    triggerProps,
    title,
    titleProps,
    description,
    descriptionProps,
    content,
    contentProps,
    overlay = true,
    overlayProps,
    closeButton = "✕",
    closeButtonProps,
  } = props;

  const alertDialog = createAlertDialog({
    id,
    defaultOpen,
    open,
    onOpenChange,
    isModal,
    closeOnOutsideClick,
    closeOnEscapeKeyDown,
    preventScroll,
    portal,
    portalTarget,
  });

  const contentChildren: SeidrChild[] = [];

  if (closeButton !== false) {
    contentChildren.push(
      alertDialog.CloseButton(
        closeButtonProps,
        closeButton === true ? "✕" : (closeButton as SeidrChild),
      ),
    );
  }

  if (title) {
    contentChildren.push(alertDialog.Title(titleProps, title));
  }

  if (description) {
    contentChildren.push(alertDialog.Description(descriptionProps, description));
  }

  if (isArr(content)) {
    contentChildren.push(...content);
  } else if (content) {
    contentChildren.push(content);
  }

  const overlayEl = overlay ? alertDialog.Overlay(overlayProps) : null;
  const contentEl = alertDialog.Content(contentProps, contentChildren);

  const rootChildren: SeidrChild[] = [];

  if (trigger) {
    rootChildren.push(alertDialog.Trigger(triggerProps, trigger));
  }

  rootChildren.push(alertDialog.Portal({}, [overlayEl, contentEl]));

  return alertDialog.Root({ as, dataComponent } as any, rootChildren);
}

/**
 * All-in-One AlertDialog component (Tier 1).
 * Features WAI-ARIA role="alertdialog", focus trapping, escape dismissal,
 * body scroll lock, screen reader isolation, portaling, and intentional
 * confirmation safety (outside click does not dismiss by default).
 */
export const AlertDialog = createComponent(AlertDialogFactory, "AlertDialog");
