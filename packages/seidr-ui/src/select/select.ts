import { createComponent, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createSelect } from "./create-select.js";
import type { SelectProps } from "./types.js";

/**
 * All-in-One accessible Select component factory (Tier 1).
 */
export function SelectFactory<Option = any, OptGroup = any>(
  props: SelectProps<Option, OptGroup> = {},
): SeidrElementTagNameMap["div"] {
  const {
    label,
    description,
    errorMessage,
    indicator = "✓",
    placeholder,
    options,
    rootProps,
    labelProps,
    triggerProps,
    valueProps,
    iconProps,
    contentProps,
    listboxProps,
    itemProps,
    ...selectOptions
  } = props;

  const sel = createSelect<Option, OptGroup>({
    placeholder,
    options,
    ...selectOptions,
  });

  return sel.Root(rootProps, [
    label ? sel.Label(labelProps, label) : null,
    sel.Trigger(triggerProps, [
      sel.Value(valueProps),
      sel.Icon(iconProps),
    ]),
    sel.Content(contentProps, [
      sel.Listbox(listboxProps, [
        sel.List(sel.normalizedOptions, {
          indicator,
          itemProps,
        }),
      ]),
    ]),
    sel.HiddenSelect(),
    description ? sel.Description({}, description) : null,
    errorMessage ? sel.ErrorMessage({}, errorMessage) : null,
  ]);
}

/**
 * Accessible Select component (`role="group"`, Tier 1).
 */
export const Select = createComponent(SelectFactory, "Select");

