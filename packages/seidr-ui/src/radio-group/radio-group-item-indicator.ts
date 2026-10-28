import {
  $,
  type DerivedValue,
  mergeValues,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { UseRadioGroupItemResult } from "./types.js";

export interface RadioGroupItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit radio group item instance providing reactive state.
   */
  instance?: UseRadioGroupItemResult;

  /**
   * Used to force mounting when more control is needed (e.g. for CSS animations).
   * When true or reactive truthy, the element is always rendered and styled via data-checked.
   * @default false
   */
  forceMount?: ReactiveValue<boolean>;
}

export type RadioGroupItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> =
  RadioGroupItemIndicatorOptions<T> & SeidrElementProps<T>;

/**
 * The visual indicator rendered when the radio item is in a checked state.
 */
export function RadioGroupItemIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function RadioGroupItemIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props: RadioGroupItemIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function RadioGroupItemIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: RadioGroupItemIndicatorProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren<RadioGroupItemIndicatorProps<T>>(propsOrChildren, children);
  const { as = "div" as T, instance: item, forceMount = false, id, ...rest } = props;

  if (!item) {
    throw new SeidrError("RadioGroupItemIndicator requires an instance prop");
  }

  const elementProps = {
    id: id ?? item.id.as((base) => `${base}-indicator`),
    ...item.dataset,
    ...rest,
  };

  const condition = mergeValues(() => !!(unwrapValue(forceMount) || item.isSelected()), {
    parents: [forceMount, item.isSelected],
  });

  return Show(condition, () => $(as as T, elementProps as SeidrElementProps<T>, content)) as DerivedValue<
    SeidrElementTagNameMap[T] | null
  >;
}
