import {
  $,
  createComponent,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { createRating } from "./create-rating.js";
import type { RatingProps, RatingRootProps } from "./types.js";

/**
 * All-in-One Tier 1 Rating component.
 * Provides an accessible, interactive star/score rating input with hover preview,
 * optional half-star precision, roving keyboard navigation, and form reset synchronization.
 */
export const Rating = createComponent(
  <T extends keyof SeidrElementTagNameMap = "div">(
    props: RatingProps<T> = {} as RatingProps<T>,
  ): SeidrElementTagNameMap[T] => {
    const {
      as = "div" as T,
      label,
      description,
      errorMessage,
      fullIcon,
      halfIcon,
      emptyIcon,
      rootProps,
      itemProps,
      children,
      max = 5,
      allowHalf = false,
      allowClear = true,
      ...ratingOptions
    } = props;

    const rating = createRating({
      max,
      allowHalf,
      allowClear,
      ...ratingOptions,
    });

    const renderedChildren: (SeidrChild | undefined)[] = [];

    if (label) {
      renderedChildren.push(rating.Label({}, label));
    }

    if (children) {
      if (Array.isArray(children)) renderedChildren.push(...children);
      else renderedChildren.push(children);
    } else {
      const itemsContainer = $(
        "div",
        {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          },
          dataPart: "group",
        } as SeidrElementProps<"div">,
        Array.from({ length: max }, (_, i) => {
          const itemVal = i + 1;
          return rating.Item(
            { value: itemVal, ...(itemProps ?? {}) },
            rating.ItemIndicator({
              itemValue: itemVal,
              fullIcon,
              halfIcon,
              emptyIcon,
            }),
          );
        }),
      );

      renderedChildren.push(itemsContainer);
    }

    if (description) {
      renderedChildren.push(rating.Description({}, description));
    }

    if (errorMessage) {
      renderedChildren.push(rating.ErrorMessage({}, errorMessage));
    }

    renderedChildren.push(rating.HiddenInput());

    return rating.Root<T>(
      {
        as,
        ...rootProps,
      } as RatingRootProps<T>,
      renderedChildren,
    );
  },
  "Rating",
);

