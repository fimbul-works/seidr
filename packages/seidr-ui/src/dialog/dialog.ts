import { isArr } from "@fimbul-works/hvat";
import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { DATA_COMPONENT_DIALOG } from "../constants.js";
import { createDialog } from "./create-dialog.js";
import type { DialogProps } from "./types.js";

export function DialogFactory<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
>(props: DialogProps<TRoot, TTrigger, TContent>): SeidrElementTagNameMap[TRoot] {
  const {
    id,
    defaultOpen,
    open,
    onOpenChange,
    isModal,
    closeOnOutsideClick,
    closeOnEscapeKeyDown,
    preventScroll,
    portal = true,
    portalTarget,
    as = "div" as TRoot,
    dataComponent = DATA_COMPONENT_DIALOG,
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

  const dialog = createDialog({
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
      dialog.CloseButton(closeButtonProps, closeButton === true ? "✕" : (closeButton as SeidrChild)),
    );
  }

  if (title) {
    contentChildren.push(dialog.Title(titleProps, title));
  }

  if (description) {
    contentChildren.push(dialog.Description(descriptionProps, description));
  }

  if (isArr(content)) {
    contentChildren.push(...content);
  } else if (content) {
    contentChildren.push(content);
  }

  const overlayEl = overlay ? dialog.Overlay(overlayProps) : null;
  const contentEl = dialog.Content(contentProps, contentChildren);

  const rootChildren: SeidrChild[] = [];

  if (trigger) {
    rootChildren.push(dialog.Trigger(triggerProps, trigger));
  }

  rootChildren.push(dialog.Portal({}, [overlayEl, contentEl]));

  return dialog.Root({ as, dataComponent } as any, rootChildren);
}

/**
 * All-in-One Dialog component (Tier 1).
 * Features WAI-ARIA role="dialog", focus trapping, outside pointer dismissal,
 * escape dismissal, body scroll lock, screen reader isolation, and portaling.
 */
export const Dialog = createComponent(DialogFactory, "Dialog");
