import { createComponent, type ReactiveValue } from "@fimbul-works/seidr";
import { createToggleGroup } from "./create-toggle-group.js";
import type { ToggleGroupProps, ToggleGroupRootProps, UseToggleGroupOptions } from "./types.js";

/**
 * Unified all-in-one ToggleGroup component (Tier 1).
 * Coordinates a group of toggle buttons with single or multiple selection models.
 */
export const ToggleGroup = createComponent((props: ToggleGroupProps = {}) => {
  const {
    id,
    orientation = "horizontal",
    multiple = false,
    value,
    defaultValue,
    onChange,
    disabled,
    disallowEmptySelection,
    loop,
    as = "div",
    items = [],
    rootProps = {},
    children,
  } = props;

  const options: UseToggleGroupOptions = multiple
    ? {
        id,
        orientation,
        multiple: true,
        value: value as ReactiveValue<string[]> | undefined,
        defaultValue: defaultValue as string[] | undefined,
        onChange: onChange as ((val: string[]) => void) | undefined,
        disabled,
        disallowEmptySelection,
        loop,
      }
    : {
        id,
        orientation,
        multiple: false,
        value: value as ReactiveValue<string | null> | undefined,
        defaultValue: defaultValue as string | null | undefined,
        onChange: onChange as ((val: string | null) => void) | undefined,
        disabled,
        disallowEmptySelection,
        loop,
      };

  const group = createToggleGroup(options);

  const itemElements = items.map((item) =>
    group.Item({ value: item.value, disabled: item.disabled, ...item.props }, item.label),
  );

  return group.Root({ as, ...rootProps } as Omit<ToggleGroupRootProps<"div">, "instance">, [...itemElements, children]);
}, "ToggleGroup");
