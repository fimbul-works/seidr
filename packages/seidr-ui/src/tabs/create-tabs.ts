import { TabsContent } from "./tabs-content.js";
import { TabsIndicator } from "./tabs-indicator.js";
import { TabsList } from "./tabs-list.js";
import { TabsRoot } from "./tabs-root.js";
import { TabsTrigger } from "./tabs-trigger.js";
import type { TabsInstance, UseTabsOptions } from "./types.js";
import { useTabs } from "./use-tabs.js";

/**
 * Creates a fine-grained coordinate instance for Tabs with pre-bound compound element helpers.
 */
export function createTabs(options: UseTabsOptions = {}): TabsInstance {
  const instance = useTabs(options);

  return {
    ...instance,
    Root: (props: any = {}, children?: any) => TabsRoot({ instance, ...props }, children),
    List: (props: any = {}, children?: any) => TabsList({ instance, ...props }, children),
    Trigger: (props: any, children?: any) => TabsTrigger({ instance, ...props }, children),
    Content: (props: any, children?: any) => TabsContent({ instance, ...props }, children),
    Indicator: (props: any = {}, children?: any) => TabsIndicator({ instance, ...props }, children),
  };
}
