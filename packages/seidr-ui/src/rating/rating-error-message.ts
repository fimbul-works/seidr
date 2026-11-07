import {
  $,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
} from "@fimbul-works/seidr";
import type { RatingErrorMessageProps } from "./types.js";

/**
 * Error message element displayed when the Rating form control is invalid.
 */
export function RatingErrorMessage<T extends keyof SeidrElementTagNameMap = "span">(
  props: RatingErrorMessageProps<T> = {} as RatingErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "span" as T,
    instance,
    dataComponent = "rating",
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("RatingErrorMessage requires an instance coordinator");
  }

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  return Show(
    instance.formControl.isInvalid,
    () =>
      $(
        as,
        {
          id: customId ?? `${instance.id}-error`,
          role: "alert",
          dataComponent,
          dataPart: "error-message",
          ...rest,
        } as SeidrElementProps<T>,
        resolvedChildren,
      ),
  ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}

