import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  mergeValues,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  type Value,
} from "@fimbul-works/seidr";
import type { UseCheckboxResult } from "./types.js";

export interface CheckboxIndicatorOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit checkbox instance providing reactive state.
   */
  instance?: UseCheckboxResult;

  /**
   * Used to force mounting when more control is needed (e.g. for CSS transitions).
   * When true, the element is always rendered and styled via data-checked / data-indeterminate.
   * @default false
   */
  forceMount?: boolean;
}

export type CheckboxIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> =
  CheckboxIndicatorOptions<T> & SeidrElementProps<T>;

/**
 * The visual indicator rendered when the checkbox is in a checked or indeterminate state.
 */
export function CheckboxIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CheckboxIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CheckboxIndicatorProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CheckboxIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CheckboxIndicatorProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null> {
  let props: CheckboxIndicatorProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as CheckboxIndicatorProps<T>) ?? ({} as CheckboxIndicatorProps<T>);
    content = children;
  } else {
    props = {} as CheckboxIndicatorProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const {
    as = "div" as T,
    instance,
    forceMount = false,
    id,
    ...rest
  } = props as any;

  if (!instance) {
    throw new SeidrError(
      "[seidr-ui]: CheckboxIndicator requires an instance prop or must be created via Checkbox.create() / Checkbox.",
    );
  }

  const elementProps = {
    id: id ?? `${instance.id}-indicator`,
    ...instance.dataset,
    ...rest,
  };

  if (forceMount) {
    return $(
      as as keyof SeidrElementTagNameMap,
      elementProps as SeidrElementProps<any>,
      content,
    ) as SeidrElementTagNameMap[T];
  }

  const isVisible = mergeValues(
    () => instance.checked() || instance.indeterminate(),
    { parents: [instance.checked, instance.indeterminate] },
  );

  return Show(
    isVisible,
    () =>
      $(
        as as keyof SeidrElementTagNameMap,
        elementProps as SeidrElementProps<any>,
        content,
      ) as SeidrElementTagNameMap[T],
  ) as Value<SeidrElementTagNameMap[T] | null>;
}
