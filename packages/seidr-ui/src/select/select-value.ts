import {
  $,
  mergeValues,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SELECT, DATA_PART_VALUE } from "../constants.js";
import type { SelectItemData, SelectNode, SelectValueProps } from "./types.js";

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
 * Element reflecting the currently selected value or placeholder within a Select.
 */
export function SelectValue<T extends keyof SeidrElementTagNameMap = "span">(
  props: SelectValueProps<T> = {} as SelectValueProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance: select,
    dataComponent = DATA_COMPONENT_SELECT,
    id: userId,
    placeholder,
    formatValue,
    ...rest
  } = props;

  if (!select) {
    throw new SeidrError("SelectValue requires an instance coordinator");
  }

  let content: SeidrChild | SeidrChild[];

  if (children !== undefined && children !== null) {
    content = children;
  } else {
    content = mergeValues(
      () => {
        const currentSelected = select.listbox.selectedValues();
        const allNodes = select.normalizedOptions();

        if (currentSelected.length === 0) {
          return placeholder ?? select.placeholder ?? "";
        }

        const flat = flattenItems(allNodes);

        const selectedNodes = currentSelected.map((val) => {
          const match = flat.find((i) => i.value === val);
          return match ?? { value: val, label: val, textValue: val, disabled: false };
        });

        if (formatValue) {
          return formatValue(selectedNodes);
        }

        if (select.isMultiple) {
          return selectedNodes.map((i) => i.textValue ?? String(i.label ?? i.value)).join(", ");
        }

        const first = selectedNodes[0];
        return first ? (first.label ?? first.textValue ?? first.value) : (placeholder ?? select.placeholder ?? "");
      },
      {
        parents: [select.isEmpty, select.listbox.selectedValues, select.normalizedOptions],
      },
    );
  }

  return $(
    as,
    {
      id: userId ?? select.valueId,
      dataComponent,
      dataPart: DATA_PART_VALUE,
      dataPlaceholderShown: select.isEmpty.as((empty) => (empty ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
