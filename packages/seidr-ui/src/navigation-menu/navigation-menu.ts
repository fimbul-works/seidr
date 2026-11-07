import {
  createComponent,
  List,
  type SeidrChild,
  type SeidrElementTagNameMap,
  wrapValue,
} from "@fimbul-works/seidr";
import { createNavigationMenu } from "./create-navigation-menu.js";
import type {
  NavigationMenuItemDescriptor,
  NavigationMenuProps,
  NavigationMenuRootProps,
} from "./types.js";

/**
 * All-in-One Tier 1 NavigationMenu component.
 * Provides a declarative, responsive website navigation bar with delay durations,
 * hover grace periods, roving tabindex focus, and support for both dropdown menus and direct links.
 */
export const NavigationMenu = createComponent(
  <T extends keyof SeidrElementTagNameMap = "nav">(
    props: NavigationMenuProps<T> = {} as NavigationMenuProps<T>,
  ): SeidrElementTagNameMap[T] => {
    const {
      as = "nav" as T,
      id,
      dataComponent = "navigation-menu",
      value,
      defaultValue,
      onValueChange,
      delayDuration = 200,
      skipDelayDuration = 300,
      loop = true,
      orientation = "horizontal",
      items,
      children,
      ...rootProps
    } = props;

    const navMenu = createNavigationMenu({
      id,
      dataComponent,
      value,
      defaultValue,
      onValueChange,
      delayDuration,
      skipDelayDuration,
      loop,
      orientation,
    });

    const renderedItems: SeidrChild[] = [];

    if (items) {
      const itemsObservable = wrapValue(items);
      renderedItems.push(
        List<NavigationMenuItemDescriptor, string>(
          itemsObservable,
          (item: NavigationMenuItemDescriptor) => item.value ?? item.href ?? "",
          (itemVal) => {
            const descriptor = itemVal();
            const itemKey = descriptor.value ?? descriptor.href ?? "item";

            if (descriptor.href) {
              return navMenu.Menu(
                {
                  value: itemKey,
                  ...(descriptor.menuProps ?? {}),
                },
                [
                  navMenu.Link(
                    {
                      value: itemKey,
                      href: descriptor.href,
                      target: descriptor.target,
                      rel: descriptor.rel,
                      disabled: descriptor.disabled,
                      ...(descriptor.linkProps ?? {}),
                    },
                    descriptor.trigger,
                  ),
                ],
              );
            }

            const menuInst = navMenu.createMenu(itemKey);

            return navMenu.Menu(
              {
                value: itemKey,
                ...(descriptor.menuProps ?? {}),
              },
              [
                menuInst.Trigger(
                  {
                    disabled: descriptor.disabled,
                    ...(descriptor.triggerProps ?? {}),
                  },
                  descriptor.trigger,
                ),
                menuInst.Content(
                  descriptor.contentProps,
                  [
                    descriptor.items ? menuInst.List(descriptor.items) : null,
                    descriptor.children,
                  ],
                ),
              ],
            );
          },
        ),
      );
    }

    return navMenu.Root<T>(
      {
        as,
        ...rootProps,
      } as NavigationMenuRootProps<T>,
      [
        navMenu.List({}, renderedItems),
        children,
      ],
    );
  },
  "NavigationMenu",
);
