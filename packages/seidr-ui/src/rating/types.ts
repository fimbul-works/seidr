import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";
import type { UseFormControlOptions, UseFormControlResult } from "../form-control/types.js";
import type { MenubarOrientation } from "../menubar/types.js";

export type RatingItemState = "checked" | "unchecked" | "half";

export interface UseRatingOptions extends UseFormControlOptions {
  /** Unique identifier for the rating component. */
  id?: string;
  /** Custom data-component attribute prefix. Defaults to "rating". */
  dataComponent?: string;
  /** Controlled value of the rating. */
  value?: ReactiveValue<number>;
  /** Default value when uncontrolled. Defaults to 0. */
  defaultValue?: number;
  /** Event handler called when the rating value changes. */
  onChange?: (value: number) => void;
  /** Maximum score/stars available. Defaults to 5. */
  max?: number;
  /** Whether half-star precision is allowed (e.g. 2.5, 3.5). Defaults to false. */
  allowHalf?: boolean;
  /** Whether clicking the active rating resets the score to 0. Defaults to true. */
  allowClear?: boolean;
  /** The orientation of the rating control. Defaults to "horizontal". */
  orientation?: MenubarOrientation;
  /** Accessible label for the rating group. */
  ariaLabel?: string;
}

export interface UseRatingResult {
  /** Base identifier for the rating component. */
  id: string;
  /** Custom data-component prefix. */
  dataComponent: string;
  /** Committed rating score. */
  value: Value<number>;
  /** Preview rating score during hover, or null when not hovering. */
  hoveredValue: Value<number | null>;
  /** Effective displayed rating score (hoveredValue ?? value). */
  displayValue: DerivedValue<number>;
  /** Maximum rating score. */
  max: number;
  /** Whether half-star precision is active. */
  allowHalf: boolean;
  /** Whether clicking the active value resets to 0. */
  allowClear: boolean;
  /** Orientation of the rating group. */
  orientation: MenubarOrientation;
  /** Whether the rating control is disabled. */
  isDisabled: DerivedValue<boolean>;
  /** Whether the rating control is read-only. */
  isReadOnly: DerivedValue<boolean>;
  /** Embedded form control manager. */
  formControl: UseFormControlResult;
  /** Ref to the root container element. */
  rootRef: Ref<HTMLElement>;
  /** Sets the committed rating value. */
  setValue: (val: number) => void;
  /** Sets the hover preview value. */
  setHoveredValue: (val: number | null) => void;
  /** Commits an item's rating score. */
  commitItemValue: (itemVal: number) => void;
  /** Handles pointer movements across an item to detect full vs half scores. */
  handleItemPointerMove: (e: PointerEvent, itemVal: number, target: HTMLElement) => void;
  /** Handles pointer entering an item. */
  handleItemPointerEnter: (e: PointerEvent, itemVal: number, target: HTMLElement) => void;
  /** Keyboard handler for roving arrow keys and Home/End. */
  handleRootKeyDown: (e: KeyboardEvent) => void;
  /** Derives the reactive state ("checked" | "unchecked" | "half") for a specific score item. */
  getItemState: (itemVal: number) => DerivedValue<RatingItemState>;
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface RatingRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  dataComponent?: string;
  instance?: UseRatingResult;
  children?: SeidrChild | SeidrChild[];
}
export type RatingRootProps<T extends keyof SeidrElementTagNameMap = "div"> =
  RatingRootOptions<T> & SeidrElementProps<T>;

export interface RatingLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseRatingResult;
  children?: SeidrChild | SeidrChild[];
}
export type RatingLabelProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RatingLabelOptions<T> & SeidrElementProps<T>;

export interface RatingItemOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  value: number;
  dataComponent?: string;
  instance?: UseRatingResult;
  children?: SeidrChild | SeidrChild[];
}
export type RatingItemProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RatingItemOptions<T> & Omit<SeidrElementProps<T>, "value">;

export interface RatingItemIndicatorOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseRatingResult;
  itemValue?: number;
  fullIcon?: SeidrChild;
  halfIcon?: SeidrChild;
  emptyIcon?: SeidrChild;
  children?: SeidrChild | SeidrChild[];
}
export type RatingItemIndicatorProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RatingItemIndicatorOptions<T> & SeidrElementProps<T>;

export interface RatingDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseRatingResult;
  children?: SeidrChild | SeidrChild[];
}
export type RatingDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RatingDescriptionOptions<T> & SeidrElementProps<T>;

export interface RatingErrorMessageOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  dataComponent?: string;
  instance?: UseRatingResult;
  children?: SeidrChild | SeidrChild[];
}
export type RatingErrorMessageProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RatingErrorMessageOptions<T> & SeidrElementProps<T>;

export interface RatingHiddenInputOptions {
  instance?: UseRatingResult;
}

// ---------------------------------------------------------------------------
// Coordinator Instance (Tier 2) & High-Level Component Props (Tier 1)
// ---------------------------------------------------------------------------

export interface RatingInstance extends UseRatingResult {
  /** Root container element factory (role="radiogroup"). */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: RatingRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Accessible label element factory. */
  Label: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Individual rating score item factory (role="radio"). */
  Item: <T extends keyof SeidrElementTagNameMap = "span">(
    props: RatingItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Score item indicator factory rendering full/half/empty states. */
  ItemIndicator: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Helper description text element factory. */
  Description: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /** Error message element factory (rendered when invalid). */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: RatingErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /** Hidden input for standard native HTML form submissions. */
  HiddenInput: (props?: RatingHiddenInputOptions) => SeidrElementTagNameMap["input"];
}

export interface RatingProps<T extends keyof SeidrElementTagNameMap = "div">
  extends UseRatingOptions {
  /** Underlying HTML tag for root container. Defaults to "div". */
  as?: T;
  /** High-level label text or element. */
  label?: SeidrChild | SeidrChild[];
  /** High-level description text or element. */
  description?: SeidrChild | SeidrChild[];
  /** High-level error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];
  /** Custom full star icon. */
  fullIcon?: SeidrChild;
  /** Custom half star icon. */
  halfIcon?: SeidrChild;
  /** Custom empty star icon. */
  emptyIcon?: SeidrChild;
  /** Custom element props for the root element. */
  rootProps?: Partial<RatingRootProps<T>>;
  /** Custom element props for each item element. */
  itemProps?: Partial<RatingItemProps>;
  /** Direct children when composing manually. */
  children?: SeidrChild | SeidrChild[];
}

