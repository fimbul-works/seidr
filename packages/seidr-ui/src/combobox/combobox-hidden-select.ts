import { $, List, type ObservableValue, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_COMBOBOX, DATA_PART_HIDDEN_SELECT } from "../constants.js";
import type { ComboboxHiddenSelectProps, ComboboxItemData } from "./types.js";

/**
 * Visually hidden native `<select>` element for standard form submissions.
 */
export function ComboboxHiddenSelect(props: ComboboxHiddenSelectProps = {}): SeidrElementTagNameMap["select"] {
  const { instance: combobox, dataComponent = DATA_COMPONENT_COMBOBOX, style: userStyle, ...rest } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxHiddenSelect requires an instance coordinator");
  }

  const visuallyHiddenStyle: Record<string, string | number> = {
    border: 0,
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    width: "1px",
    whiteSpace: "nowrap",
  };

  const combinedStyle =
    typeof userStyle === "object" && userStyle !== null
      ? { ...visuallyHiddenStyle, ...userStyle }
      : visuallyHiddenStyle;

  const selectedOptionsObservable = combobox.selectedOptions as unknown as ObservableValue<ComboboxItemData[]>;

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
      style: combinedStyle,
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
