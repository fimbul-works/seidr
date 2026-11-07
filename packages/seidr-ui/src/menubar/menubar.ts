import {
  createComponent,
  List,
  type SeidrChild,
  type SeidrElementTagNameMap,
  wrapValue,
} from "@fimbul-works/seidr";
import { createMenubar } from "./create-menubar.js";
import type { MenubarMenuDescriptor, MenubarProps, MenubarRootProps } from "./types.js";

/**
 * All-in-One Tier 1 Menubar component.
 * Provides a declarative desktop-style application menubar with full WAI-ARIA roles,
 * roving tabindex focus, arrow key switching, and hover switching across sibling menus.
 */
export const Menubar = createComponent(
  <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenubarProps<T> = {} as MenubarProps<T>,
  ): SeidrElementTagNameMap[T] => {
    const {
      as = "div" as T,
      id,
      dataComponent = "menubar",
      value,
      defaultValue,
      onValueChange,
      loop = true,
      orientation = "horizontal",
      focusOnAlt = false,
      menus,
      children,
      ...rootProps
    } = props;

    const menubar = createMenubar({
      id,
      dataComponent,
      value,
      defaultValue,
      onValueChange,
      loop,
      orientation,
      focusOnAlt,
    });

    const renderedMenus: SeidrChild[] = [];

    if (menus) {
      const menusObservable = wrapValue(menus);
      renderedMenus.push(
        List<MenubarMenuDescriptor, string>(
          menusObservable,
          (m) => m.value,
          (itemVal) => {
            const descriptor = itemVal();
            const menuInst = menubar.createMenu(descriptor.value);

            return menubar.Menu(
              {
                value: descriptor.value,
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

    return menubar.Root<T>(
      {
        as,
        ...rootProps,
      } as MenubarRootProps<T>,
      [...renderedMenus, children],
    );
  },
  "Menubar",
);
