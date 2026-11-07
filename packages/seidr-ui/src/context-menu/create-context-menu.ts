import { createValue, type SeidrChild, type SeidrElementTagNameMap, useId, type Value } from "@fimbul-works/seidr";
import { createMenu } from "../menu/create-menu.js";
import type { AnchorRect } from "../popper/types.js";
import { ContextMenuTrigger } from "./context-menu-trigger.js";
import type { ContextMenuInstance, ContextMenuTriggerProps, UseContextMenuOptions } from "./types.js";

/**
 * Creates a headless coordinator for a ContextMenu (Tier 2).
 * Returns pre-bound element helpers with `dataComponent="context-menu"`, virtual anchor positioning,
 * right-click / touch long-press event management, and reactive observables.
 */
export function createContextMenu(options: UseContextMenuOptions = {}): ContextMenuInstance {
  const {
    id = useId("contextmenu"),
    dataComponent = "context-menu",
    placement = "right-start",
    getAnchorRect: customGetAnchorRect,
    ...rest
  } = options;

  const anchorRect: Value<AnchorRect> = createValue<AnchorRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const setAnchorRect = (rect: AnchorRect) => {
    anchorRect(rect);
  };

  const menu = createMenu({
    id,
    dataComponent,
    placement,
    getAnchorRect: (anchor) => {
      if (customGetAnchorRect) {
        return customGetAnchorRect(anchor);
      }
      return anchorRect();
    },
    ...rest,
  });

  const instance: ContextMenuInstance = {
    ...menu,
    anchorRect,
    setAnchorRect,
    Trigger: <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<ContextMenuTriggerProps<T>, "instance"> = {} as Omit<ContextMenuTriggerProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ContextMenuTrigger({ instance, ...props } as ContextMenuTriggerProps<T>, children),
  };

  return instance;
}

