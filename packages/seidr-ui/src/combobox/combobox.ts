import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createCombobox } from "./create-combobox.js";
import type { ComboboxProps } from "./types.js";

/**
 * All-in-one headless Combobox component (Tier 1).
 *
 * Automatically provides accessible markup, reactive filtering, Popper positioning,
 * and hidden native `<select>` form integration.
 */
export const Combobox = createComponent(function Combobox<Option = any, OptGroup = any>(
  props: ComboboxProps<Option, OptGroup>,
): SeidrElementTagNameMap["div"] {
  const {
    label,
    description,
    errorMessage,
    indicator,
    inputProps,
    triggerProps,
    controlProps,
    contentProps,
    listboxProps,
    rootProps,
    hiddenSelectProps,
    itemProps,
    ...options
  } = props;

  const cb = createCombobox(options);

  const children: (SeidrChild | null)[] = [
    label !== undefined ? cb.Label({}, label) : null,
    cb.Control(
      controlProps,
      [
        cb.Input(inputProps),
        cb.Trigger(triggerProps, [cb.Icon()]),
      ],
    ),
    cb.Content(
      contentProps,
      [
        cb.Listbox(
          listboxProps,
          [
            cb.List(cb.displayedOptions, { indicator, itemProps }),
          ],
        ),
      ],
    ),
    description !== undefined ? cb.Description({}, description) : null,
    errorMessage !== undefined ? cb.ErrorMessage({}, errorMessage) : null,
    cb.HiddenSelect(hiddenSelectProps),
  ];

  return cb.Root(rootProps, children.filter((c): c is SeidrChild => c !== null));
}, "Combobox");

