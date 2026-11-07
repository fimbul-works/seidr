import type {
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
  Value,
} from "@fimbul-works/seidr";

/** Base side placement. */
export type BasePlacement = "top" | "bottom" | "left" | "right";

/** Full placement with optional alignment. */
export type Placement = BasePlacement | `${BasePlacement}-start` | `${BasePlacement}-end`;

/** Virtual anchor bounding box coordinates. */
export interface AnchorRect {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/** Options for configuring `usePopper`. */
export interface UsePopperOptions {
  /** Optional custom ID. */
  id?: string;

  /** A ref or element getter for the anchor element. */
  anchorRef?: Ref<HTMLElement> | (() => HTMLElement | null | undefined);

  /** A ref or element getter for the floating content element. */
  contentRef?: Ref<HTMLElement> | (() => HTMLElement | null | undefined);

  /**
   * Custom function returning the anchor's DOMRect.
   * Overrides `anchor.getBoundingClientRect()`.
   */
  getAnchorRect?: (anchor?: HTMLElement) => AnchorRect | undefined;

  /**
   * Preferred placement of the floating popper relative to the anchor.
   * Can be a static placement or a reactive observable.
   * @default "bottom"
   */
  placement?: ReactiveValue<Placement>;

  /**
   * Spacing between the popper and the anchor element.
   * @default 0
   */
  gutter?: number;

  /**
   * Skidding distance of the popper along the anchor element axis.
   * @default 0
   */
  shift?: number;

  /**
   * Viewport boundary overflow handling:
   * - boolean: whether to flip to the opposite side
   * - string: space-delimited fallback placements (e.g. "top bottom")
   * @default true
   */
  flip?: boolean | string;

  /**
   * Whether the popper should slide along the viewport edge when overflowing.
   * @default true
   */
  slide?: boolean;

  /**
   * Whether the popper can overlap the anchor element when overflowing.
   * @default false
   */
  overlap?: boolean;

  /**
   * Whether the popper should match the width of the anchor element.
   * Sets `--seidr-popper-anchor-width`.
   * @default false
   */
  sameWidth?: boolean;

  /**
   * Whether the popper should be constrained to fit within the viewport.
   * Sets `--seidr-popper-content-available-width` and `--seidr-popper-content-available-height`.
   * @default false
   */
  fitViewport?: boolean;

  /**
   * Whether to hide the popper if the anchor becomes occluded/detached.
   * @default false
   */
  hideWhenDetached?: boolean;

  /**
   * Minimum padding before considering the anchor detached.
   * @default 0
   */
  detachedPadding?: number;

  /**
   * Minimum padding between the arrow and the popper corner.
   * @default 4
   */
  arrowPadding?: number;

  /**
   * Minimum padding between the popper and the viewport edge.
   * @default 8
   */
  overflowPadding?: number;

  /** Callback invoked when the effective placement changes dynamically (e.g. on flip). */
  onCurrentPlacementChange?: (currentPlacement: Placement) => void;
}

/** Return interface of `usePopper`. */
export interface UsePopperResult {
  /** Identifier of the popper instance. */
  id: string;

  /** Configured preferred placement (reactive observable). */
  placement: ObservableValue<Placement>;

  /** Reactive observable of current placement. */
  currentPlacement: Value<Placement>;

  /** Ref for the anchor/reference element. */
  anchorRef: Ref<HTMLElement>;

  /** Ref for the floating positioner element. */
  positionerRef: Ref<HTMLElement>;

  /** Ref for the optional arrow element. */
  arrowRef: Ref<HTMLElement>;

  /** Ref for the floating content element. */
  contentRef: Ref<HTMLElement>;

  /** Imperative position recalculation. */
  updatePosition: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Subcomponent Props
// ---------------------------------------------------------------------------

export interface PopperRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UsePopperResult;
  dataComponent?: string;
}

export type PopperRootProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperRootOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopperRootOptions<T>>;

export interface PopperPositionerOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UsePopperResult;
  dataComponent?: string;
}

export type PopperPositionerProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperPositionerOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopperPositionerOptions<T>>;

export interface PopperArrowOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UsePopperResult;
  size?: number;
  dataComponent?: string;
}

export type PopperArrowProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperArrowOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopperArrowOptions<T>>;

// ---------------------------------------------------------------------------
// Coordinator & Tier Types
// ---------------------------------------------------------------------------

/** Tier 2 Coordinator instance returned by `createPopper`. */
export interface PopperInstance extends UsePopperResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<PopperRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Positioner: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<PopperPositionerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<PopperArrowProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

/** Tier 1 All-in-One Component Props. */
export interface PopperOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UsePopperOptions {
  as?: T;
  rootProps?: Omit<PopperRootProps<T>, "instance" | "as">;
  positionerProps?: Omit<PopperPositionerProps<"div">, "instance">;
  arrowProps?: Omit<PopperArrowProps<"div">, "instance">;
  showArrow?: boolean;
}

export type PopperProps<T extends keyof SeidrElementTagNameMap = "div"> = PopperOptions<T> &
  Omit<SeidrElementProps<T>, keyof PopperOptions<T>>;
