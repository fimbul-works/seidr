import {
  $,
  type DerivedValue,
  mergeValues,
  type ObservableValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import type { TabsContentProps } from "./types.js";

/**
 * Contains the content associated with a tab trigger (role="tabpanel").
 */
export function TabsContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: TabsContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | ObservableValue<SeidrElementTagNameMap[T] | null> {
  const { as = "div" as T, instance: tabs, value, forceMount, id: customId, tabIndex = 0, ...rest } = props;

  if (!tabs) {
    throw new SeidrError("TabsContent requires an instance coordinator");
  }

  if (!value) {
    throw new SeidrError("TabsContent requires a 'value' prop");
  }

  const isSelected = tabs.isSelected(value);
  const contentId = customId ?? tabs.generateContentId(value);
  const triggerId = tabs.generateTriggerId(value);

  const wrappedForceMount = wrapValue(forceMount ?? false);

  const shouldMount = mergeValues(() => !!wrappedForceMount() || isSelected(), {
    parents: [wrappedForceMount, isSelected],
  });

  const hidden = mergeValues(() => (wrappedForceMount() ? !isSelected() : undefined), {
    parents: [wrappedForceMount, isSelected],
  });

  return Show(shouldMount, () =>
    $(
      as as T,
      {
        id: contentId,
        role: "tabpanel",
        tabIndex,
        ariaLabelledby: triggerId,
        dataOrientation: tabs.orientation,
        dataSelected: isSelected.as((s) => (s ? "" : undefined)),
        hidden,
        dataComponent: "tabs",
        dataPart: "content",
        ...rest,
      } as SeidrElementProps<T>,
      children,
    ),
  ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
