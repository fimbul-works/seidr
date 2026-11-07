import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  onMounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  useId,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { NavigationMenuLinkProps } from "./types.js";

/**
 * Direct navigation link item in a NavigationMenu (role="menuitem").
 */
export function NavigationMenuLink<T extends keyof SeidrElementTagNameMap = "a">(
  props: NavigationMenuLinkProps<T> = {} as NavigationMenuLinkProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "a" as T,
    navigationMenuInstance: navMenu,
    value: userValue,
    dataComponent = "navigation-menu",
    ref: userRef,
    href,
    target,
    rel,
    disabled,
    ariaDisabled,
    onfocus: userOnFocus,
    onpointerenter: userOnPointerEnter,
    children: propsChildren,
    ...rest
  } = props;

  const autoId = useId("nav-link");
  const value = userValue !== undefined ? unwrapValue(userValue) : autoId;

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
  });

  if (navMenu) {
    onMounted(() => {
      const unregister = navMenu.registerMenu({
        value,
        focusTrigger: () => {
          const el = internalRef();
          if (el && "focus" in el) {
            (el as HTMLElement).focus();
          }
        },
        getTriggerElement: () => (internalRef() as HTMLElement) ?? null,
        open: () => {},
        close: () => {},
        isDisabled: () => {
          const el = internalRef();
          return Boolean(el?.hasAttribute("disabled") || el?.getAttribute("aria-disabled") === "true");
        },
      });

      return unregister;
    });
  }

  const isCurrentActive: DerivedValue<boolean> | undefined = navMenu
    ? navMenu.activeTrigger.as((a) => a === value)
    : undefined;

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented && navMenu) {
      navMenu.activeTrigger(value);
    }
  };

  const handlePointerEnter = (e: PointerEvent) => {
    if (isFn(userOnPointerEnter)) {
      Reflect.apply(userOnPointerEnter, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (navMenu && navMenu.isOpen()) {
      navMenu.closeMenu();
    }
  };

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

    return $(
      as,
      {
        ref: internalRef,
        role: "menuitem",
        href,
        target,
        rel,
        "aria-disabled": (ariaDisabled ?? disabled) ? "true" : undefined,
        tabindex: isCurrentActive ? isCurrentActive.as((a) => (a ? 0 : -1)) : 0,
        dataComponent,
        dataPart: "link",
        dataValue: value,
        dataDisabled: disabled ? "" : undefined,
        onfocus: handleFocus,
        onpointerenter: handlePointerEnter,
        ...rest,
      } as SeidrElementProps<T>,
      resolvedChildren,
    );
}
