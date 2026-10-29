import { createComponent } from "@fimbul-works/seidr";
import { createTabs } from "./create-tabs.js";
import type { TabsProps, TabsRootProps } from "./types.js";

/**
 * Unified all-in-one Tabs component.
 * Creates an accessible tabbed interface with full WAI-ARIA compliance in one call.
 */
export const Tabs = createComponent((props: TabsProps = {}) => {
  const {
    id,
    value,
    defaultValue,
    onChange,
    orientation = "horizontal",
    activationMode = "automatic",
    disabled,
    shouldFocusWrap = true,
    as = "div",
    items,
    rootProps = {},
    listProps = {},
    indicator = false,
    children,
  } = props;

  const tabs = createTabs({
    id,
    value,
    defaultValue,
    onChange,
    orientation,
    activationMode,
    disabled,
    shouldFocusWrap,
  });

  if (items && items.length > 0) {
    const triggerElements = items.map((item) =>
      tabs.Trigger(
        {
          value: item.value,
          disabled: item.disabled,
          ...(item.triggerProps ?? {}),
        },
        item.trigger,
      ),
    );

    const indicatorElement = indicator ? tabs.Indicator(typeof indicator === "object" ? indicator : {}) : null;

    const contentElements = items.map((item) =>
      tabs.Content(
        {
          value: item.value,
          ...(item.contentProps ?? {}),
        },
        item.content,
      ),
    );

    return tabs.Root({ as, ...rootProps } as Omit<TabsRootProps<"div">, "instance">, [
      tabs.List(listProps, [...triggerElements, indicatorElement]),
      ...contentElements,
      children,
    ]);
  }

  return tabs.Root({ as, ...rootProps } as Omit<TabsRootProps<"div">, "instance">, children);
}, "Tabs");
