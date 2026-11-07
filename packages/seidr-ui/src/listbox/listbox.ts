import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createListbox } from "./create-listbox.js";
import type { ListboxProps, ListboxRootProps } from "./types.js";

/**
 * All-in-One Listbox component factory (Tier 1).
 */
export function ListboxFactory<T extends keyof SeidrElementTagNameMap = "ul">(
  props: ListboxProps<T> = {} as ListboxProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "ul" as T,
    items,
    selectionMode,
    value,
    defaultValue,
    onChange,
    onValueChange,
    disallowEmptySelection,
    shouldFocusWrap,
    shouldFocusOnHover,
    orientation,
    disabled,
    disallowTypeAhead,
    autoFocus,
    rootProps,
    itemProps,
    indicator = "✓",
    id,
    ...rest
  } = props;

  const lb = createListbox({
    id,
    selectionMode,
    value,
    defaultValue,
    onChange: onChange ?? onValueChange,
    onValueChange: onValueChange ?? onChange,
    disallowEmptySelection,
    shouldFocusWrap,
    shouldFocusOnHover,
    orientation,
    disabled,
    disallowTypeAhead,
    autoFocus,
  });

  const content: SeidrChild[] = [];

  if (items && items.length > 0) {
    for (const item of items) {
      const itemEl = lb.Item({
        value: item.value,
        label: item.label,
        description: item.description,
        indicator,
        disabled: item.disabled,
        textValue: item.textValue ?? item.label,
        ...(itemProps ?? {}),
      });
      content.push(itemEl);
    }
  }

  if (children) {
    if (Array.isArray(children)) {
      content.push(...children);
    } else {
      content.push(children);
    }
  }

  return lb.Root({ as, ...rootProps, ...rest } as ListboxRootProps<T>, content);
}

/**
 * Accessible Listbox component (`role="listbox"`, Tier 1).
 */
export const Listbox = createComponent(ListboxFactory, "Listbox");
