import {
  $,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { RatingDescription } from "./rating-description.js";
import { RatingErrorMessage } from "./rating-error-message.js";
import { RatingItemIndicator } from "./rating-item-indicator.js";
import { RatingItem } from "./rating-item.js";
import { RatingLabel } from "./rating-label.js";
import { RatingRoot } from "./rating-root.js";
import type {
  RatingDescriptionProps,
  RatingErrorMessageProps,
  RatingHiddenInputOptions,
  RatingInstance,
  RatingItemIndicatorProps,
  RatingItemProps,
  RatingLabelProps,
  RatingRootProps,
  UseRatingOptions,
} from "./types.js";
import { useRating } from "./use-rating.js";

/**
 * Creates a headless coordinator for a Rating system (Tier 2).
 * Returns pre-bound element helpers and fine-grained reactive state.
 */
export function createRating(options: UseRatingOptions = {}): RatingInstance {
  const rating = useRating(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: RatingRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    RatingRoot<T>({ instance: rating, ...props } as RatingRootProps<T>, children);

  const Label = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    RatingLabel<T>({ instance: rating, ...props } as RatingLabelProps<T>, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "span">(
    props: RatingItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    RatingItem<T>({ instance: rating, ...props } as RatingItemProps<T>, children);

  const ItemIndicator = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    RatingItemIndicator<T>(
      { instance: rating, ...props } as RatingItemIndicatorProps<T>,
      children,
    );

  const Description = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    RatingDescription<T>(
      { instance: rating, ...props } as RatingDescriptionProps<T>,
      children,
    );

  const ErrorMessage = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    RatingErrorMessage<T>(
      { instance: rating, ...props } as RatingErrorMessageProps<T>,
      children,
    );

  const HiddenInput = (props?: RatingHiddenInputOptions): SeidrElementTagNameMap["input"] => {
    return $(
      "input",
      {
        type: "hidden",
        name: rating.formControl.name,
        value: rating.value.as((v) => String(v)),
        disabled: rating.isDisabled,
        required: rating.formControl.isRequired,
        "aria-hidden": "true",
        tabindex: -1,
        style: { display: "none" },
        ...props,
      } as SeidrElementProps<"input">,
    );
  };

  return {
    ...rating,
    Root,
    Label,
    Item,
    ItemIndicator,
    Description,
    ErrorMessage,
    HiddenInput,
  };
}

