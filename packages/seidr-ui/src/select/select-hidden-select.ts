import { $, createRef, inClient, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_SELECT, DATA_PART_HIDDEN_INPUT, DATA_PART_HIDDEN_SELECT } from "../constants.js";
import type { SelectHiddenSelectProps, SelectItemData, SelectNode } from "./types.js";

function flattenItems(nodes: SelectNode[]): SelectItemData[] {
  const result: SelectItemData[] = [];
  for (const node of nodes) {
    if (node.type === "section") {
      result.push(...flattenItems(node.items));
    } else {
      result.push(node);
    }
  }
  return result;
}

/**
 * Visually hidden native `<select>` element for form participation, validation, and browser autofill.
 */
export function SelectHiddenSelect(props: SelectHiddenSelectProps = {}): SeidrElementTagNameMap["select"] {
  const { instance: select, dataComponent = DATA_COMPONENT_SELECT, ...rest } = props;

  if (!select) {
    throw new SeidrError("SelectHiddenSelect requires an instance coordinator");
  }

  const selectRef = createRef<HTMLSelectElement>();

  inClient(() => {
    select.listbox.selectedValues.bind((vals) => {
      const el = selectRef();
      if (!el) return;

      Array.from(el.options).forEach((opt) => {
        opt.selected = vals.includes(opt.value);
      });

      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

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

  const renderOptions = (nodes: SelectNode[]) => {
    const flat = flattenItems(nodes);
    return flat.map((item) =>
      $(
        "option",
        {
          value: item.value,
          disabled: item.disabled,
          selected: select.listbox.isSelected(item.value),
        },
        item.textValue ?? String(item.label ?? item.value),
      ),
    );
  };

  inClient(() => {
    select.normalizedOptions.watch((nodes) => {
      const el = selectRef();
      if (!el) return;
      el.innerHTML = "";
      renderOptions(nodes).forEach((opt) => el.appendChild(opt));
    });
  });

  return $(
    "select",
    {
      ref: selectRef,
      name: select.name,
      disabled: select.isDisabled,
      required: select.isRequired,
      multiple: select.isMultiple,
      tabIndex: -1,
      ariaHidden: "true",
      dataComponent,
      dataPart: DATA_PART_HIDDEN_SELECT,
      style: visuallyHiddenStyle,
      ...rest,
    },
    renderOptions(select.normalizedOptions()),
  );
}
