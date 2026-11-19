import { $, List, mergeStyleProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_COMBOBOX, DATA_PART_HIDDEN_SELECT, VISUALLY_HIDDEN_STYLES } from "../constants.js";
import type { ComboboxHiddenSelectProps, ComboboxItemData } from "./types.js";

/**
 * Visually hidden native `<select>` element for standard form submissions.
 */
export function ComboboxHiddenSelect(props: ComboboxHiddenSelectProps = {}): SeidrElementTagNameMap["select"] {
  const { instance: combobox, dataComponent = DATA_COMPONENT_COMBOBOX, style: userStyle, ...rest } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxHiddenSelect requires an instance coordinator");
  }

  const selectedOptionsObservable = combobox.selectedOptions;

  return $(
    "select",
    {
      tabIndex: -1,
      ariaHidden: "true",
      name: combobox.name,
      disabled: combobox.isDisabled,
      required: combobox.isRequired,
      multiple: combobox.isMultiple ? true : undefined,
      dataComponent,
      dataPart: DATA_PART_HIDDEN_SELECT,
      style: mergeStyleProps(VISUALLY_HIDDEN_STYLES, userStyle),
      ...rest,
    },
    [
      List<ComboboxItemData, string>(
        selectedOptionsObservable,
        (item) => item.value,
        (itemVal) => {
          return $(
            "option",
            {
              value: itemVal.as((i) => i.value),
              selected: true,
            },
            [itemVal.as((i) => i.label ?? i.value)],
          );
        },
      ),
    ],
  );
}
