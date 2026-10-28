import { createRef, createValue, mergeValues, type SeidrElementProps, wrapValue } from "@fimbul-works/seidr";
import type {
  RadioGroupItemDataSet,
  UseRadioGroupItemOptions,
  UseRadioGroupItemResult,
  UseRadioGroupResult,
} from "./types.js";

/**
 * Headless hook managing state, accessibility attributes, and identifiers
 * for an individual RadioGroup option item.
 */
export function useRadioGroupItem(
  group: UseRadioGroupResult,
  options: UseRadioGroupItemOptions,
): UseRadioGroupItemResult {
  const value = options.value;
  const id = wrapValue(options.id ?? group.id.as((gid) => `${gid}-item-${value}`));
  const inputId = id.as((bid) => `${bid}-input`);
  const labelId = id.as((bid) => `${bid}-label`);
  const descriptionId = id.as((bid) => `${bid}-description`);

  const inputRef = createRef<HTMLInputElement>();
  const controlRef = createRef<HTMLElement>();
  const isFocused = createValue(false);

  const isSelected = group.value.as((curr) => curr === value);

  const isDisabled = group.formControl.isDisabled.as((groupDis) => Boolean(groupDis || options.disabled));

  const select = () => {
    if (isDisabled() || group.formControl.isReadOnly()) {
      return;
    }
    group.setSelectedValue(value);
  };

  const dataset: RadioGroupItemDataSet = {
    ...group.dataset,
    "data-disabled": isDisabled.as((d) => (d ? "" : undefined)),
    "data-checked": isSelected.as((s) => (s ? "" : undefined)),
  };

  const ariaDescribedBy = mergeValues(
    () => {
      const parts: string[] = [];
      const groupDesc = group.formControl.ariaDescribedBy();
      if (groupDesc) parts.push(groupDesc);
      return parts.length > 0 ? parts.join(" ") : undefined;
    },
    { parents: [group.formControl.ariaDescribedBy] },
  );

  const fieldProps: SeidrElementProps<"input"> = {
    id: inputId,
    type: "radio",
    name: group.name,
    value,
    checked: isSelected,
    disabled: isDisabled,
    readOnly: group.formControl.isReadOnly,
    required: group.formControl.isRequired,
    "aria-labelledby": labelId,
    "aria-describedby": ariaDescribedBy,
    ...dataset,
  };

  return {
    id: id.as((id) => id),
    value,
    isSelected,
    isDisabled,
    isFocused,
    select,
    group,
    inputRef,
    controlRef,
    dataset,
    fieldProps,
    inputId,
    labelId,
    descriptionId,
  };
}
