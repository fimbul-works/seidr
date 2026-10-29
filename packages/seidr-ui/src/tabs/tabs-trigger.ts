import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  mergeValues,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  wrapValue,
} from "@fimbul-works/seidr";
import type { TabsTriggerProps } from "./types.js";

/**
 * Interactive button that activates its associated tab panel (role="tab").
 */
export function TabsTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: TabsTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance: tabs,
    value,
    disabled = false,
    ref: userRef,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    onfocus: userOnFocus,
    id: customId,
    type = "button",
    ...rest
  } = props;

  if (!tabs) {
    throw new SeidrError("TabsTrigger requires an instance coordinator");
  }

  if (!value) {
    throw new SeidrError("TabsTrigger requires a 'value' prop");
  }

  const disabledObservable = wrapValue(disabled);
  const effectiveDisabled = mergeValues(() => tabs.isDisabled() || !!disabledObservable(), {
    parents: [tabs.isDisabled, disabledObservable],
  });

  const triggerRef = createRef<SeidrElementTagNameMap[T]>();

  triggerRef.bind((el) => {
    if (userRef) {
      userRef(el as SeidrElementTagNameMap[T]);
    }
    if (el) {
      return tabs.registerTrigger(value, el, effectiveDisabled);
    }
  });

  const isSelected = tabs.isSelected(value);

  const tabIndex = mergeValues(
    () => {
      if (effectiveDisabled()) return undefined;
      return tabs.focusedKey() === value ? 0 : -1;
    },
    { parents: [effectiveDisabled, tabs.focusedKey] },
  );

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      (userOnClick as any)(e);
    }
    if (e.defaultPrevented || effectiveDisabled()) return;

    tabs.setSelectedValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      (userOnKeyDown as any)(e);
    }
    if (e.defaultPrevented) return;

    tabs.handleKeyDown(e, value);
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      (userOnFocus as any)(e);
    }
    tabs.focusedKey(value);
  };

  const triggerId = customId ?? tabs.generateTriggerId(value);
  const contentId = tabs.generateContentId(value);

  return $(
    as as T,
    {
      id: triggerId,
      ref: triggerRef,
      type: as === "button" ? type : undefined,
      role: "tab",
      tabIndex,
      disabled: effectiveDisabled,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      onfocus: handleFocus,
      ariaSelected: isSelected.as((s) => (s ? "true" : "false")),
      ariaDisabled: effectiveDisabled.as((d) => (d ? "true" : undefined)),
      ariaControls: isSelected.as((s) => (s ? contentId : undefined)),
      dataKey: value,
      dataOrientation: tabs.orientation,
      dataSelected: isSelected.as((s) => (s ? "" : undefined)),
      dataDisabled: effectiveDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: "tabs",
      dataPart: "trigger",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
