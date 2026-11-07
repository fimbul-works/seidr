import type {
  DerivedValue,
  ReactiveStyleDeclaration,
  ReactiveValue,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { ButtonProps } from "../button.js";
import type { ToastIntlTranslations, ToastRegionIntlTranslations } from "./toast.intl.js";

export type ToastSwipeDirection = "up" | "down" | "left" | "right";

export type ToastPromiseState = "pending" | "fulfilled" | "rejected";

export type ToastPriority = "high" | "low";

export type ToastSwipeState = "start" | "move" | "cancel" | "end";

export interface ToastSwipeEventDetail {
  originalEvent: PointerEvent;
  delta: { x: number; y: number };
}

export type ToastSwipeEvent = CustomEvent<ToastSwipeEventDetail> & {
  currentTarget: HTMLElement;
};

export interface ToastComponentProps {
  /** A unique id for the toast. */
  toastId: number;
  /** The region coordinator hosting this toast. */
  region?: UseToastRegionResult;
}

export type ToastComponent = (props: ToastComponentProps) => SeidrChild;

export interface ToastPromiseComponentProps<T, U = Error> extends ToastComponentProps {
  /** The state of the promise. */
  state: ToastPromiseState;
  /** The resolved data of the promise when fulfilled. */
  data?: T;
  /** The error of the promise when rejected. */
  error?: U;
}

export type ToastPromiseComponent<T, U = Error> = (props: ToastPromiseComponentProps<T, U>) => SeidrChild;

export interface ToastConfig {
  /** The unique id of the toast. */
  id: number;
  /** Whether the toast should be marked for dismiss. */
  dismiss: boolean;
  /** Whether the toast was updated in-place. */
  update: boolean;
  /** The toast factory function to render. */
  toastComponent: ToastComponent;
  /** The id of the ToastRegion to display the toast in. */
  region?: string;
}

export interface ShowToastOptions {
  /** The id of the ToastRegion to display the toast in. */
  region?: string;
}

// ============================================================================
// Toast Region Types
// ============================================================================

export interface UseToastRegionOptions {
  /** Unique ID for the region DOM element. */
  id?: string;

  /** The localized strings of the region component. */
  translations?: ToastRegionIntlTranslations;

  /**
   * A label for the toast region to provide context for screen reader users.
   * Can contain a `{hotkey}` placeholder which will be replaced automatically.
   * @default "Notifications ({hotkey})"
   */
  ariaLabel?: ReactiveValue<string | undefined>;

  /**
   * The keys to use as the keyboard shortcut that will move focus to the toast region.
   * @default ["altKey", "KeyT"]
   */
  hotkey?: string[];

  /**
   * The time in milliseconds that should elapse before automatically closing each toast.
   * @default 5000
   */
  duration?: ReactiveValue<number>;

  /**
   * The maximum amount of toasts that can be displayed at the same time.
   * @default 3
   */
  limit?: ReactiveValue<number>;

  /**
   * The direction of the pointer swipe that should close the toast.
   * @default "right"
   */
  swipeDirection?: ReactiveValue<ToastSwipeDirection>;

  /**
   * The distance in pixels that the swipe gesture must travel before a close is triggered.
   * @default 50
   */
  swipeThreshold?: ReactiveValue<number>;

  /**
   * Whether the toasts close timeout should pause when a toast is hovered or focused.
   * @default true
   */
  pauseOnInteraction?: ReactiveValue<boolean>;

  /**
   * Whether the toasts close timeout should pause when the document loses focus or the page is idle.
   * @default true
   */
  pauseOnPageIdle?: ReactiveValue<boolean>;

  /**
   * Whether the toast region is marked as a top layer.
   * @default true
   */
  topLayer?: ReactiveValue<boolean>;

  /** The id of the toast region, used for multiple toast regions. */
  regionId?: string;

  /**
   * Component semantic name for CSS annotations.
   * @default "toast"
   */
  dataComponent?: string;
}

export interface UseToastRegionResult {
  /** Unique ID for the region element. */
  id: string;
  /** Optional region identifier for filtering multi-region toasts. */
  regionId: string | undefined;
  /** Component semantic name for CSS annotations. */
  dataComponent: string;
  /** Whether timers in this region are currently paused. */
  isPaused: DerivedValue<boolean>;
  /** Visible active toasts for this region (capped at limit). */
  toasts: DerivedValue<ToastConfig[]>;
  /** Whether the region currently has at least one visible toast. */
  hasToasts: DerivedValue<boolean>;
  /** Configured hotkey combination. */
  hotkey: string[];
  /** Formatted aria-label with hotkey placeholder resolved. */
  ariaLabel: DerivedValue<string>;
  /** Default toast duration in milliseconds. */
  duration: DerivedValue<number>;
  /** Configured swipe direction. */
  swipeDirection: DerivedValue<ToastSwipeDirection>;
  /** Configured swipe distance threshold in pixels. */
  swipeThreshold: DerivedValue<number>;
  /** Whether timers pause on hover/focus interaction. */
  pauseOnInteraction: DerivedValue<boolean>;
  /** Whether timers pause on window blur. */
  pauseOnPageIdle: DerivedValue<boolean>;
  /** Whether the region is a top layer. */
  topLayer: DerivedValue<boolean>;
  /** Pauses all toast timers in this region. */
  pauseAllTimer: () => void;
  /** Resumes all toast timers in this region. */
  resumeAllTimer: () => void;
  /** Generates a scoped sub-element ID. */
  generateId: (part: string) => string;
}

export interface ToastRegionSubcomponentProps {
  /** The internal ToastRegion coordinator instance. */
  instance?: UseToastRegionResult;
  id?: string;
  style?: ReactiveStyleDeclaration;
  role?: string;
  tabIndex?: ReactiveValue<number>;
  dataComponent?: string;
  ariaLabel?: ReactiveValue<string | undefined>;
  "aria-label"?: ReactiveValue<string | undefined>;
  ariaLabelledBy?: ReactiveValue<string | undefined>;
  "aria-labelledby"?: ReactiveValue<string | undefined>;
  ariaDescribedBy?: ReactiveValue<string | undefined>;
  "aria-describedby"?: ReactiveValue<string | undefined>;
}

export type ToastRegionRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ToastRegionSubcomponentProps & {
    as?: T;
  };

export type ToastListProps<T extends keyof SeidrElementTagNameMap = "ol"> = SeidrElementProps<T> &
  ToastRegionSubcomponentProps & {
    as?: T;
    onfocusin?: (e: FocusEvent) => void;
    onfocusout?: (e: FocusEvent) => void;
  };

export type ToastRegionInstance = UseToastRegionResult & {
  Region: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ToastRegionRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  List: <T extends keyof SeidrElementTagNameMap = "ol">(
    props?: ToastListProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
};

export interface ToastRegionProps extends UseToastRegionOptions {
  /** Polymorphic tag name for the region element. Defaults to "div". */
  as?: keyof SeidrElementTagNameMap;
  /** Optional target element to portal the ToastRegion into (e.g. `getDocument().body`). */
  portalTarget?: HTMLElement;
  /** Props passed directly to ToastRegion.Region. */
  regionProps?: ToastRegionRootProps<"div">;
  /** Props passed directly to ToastRegion.List. */
  listProps?: ToastListProps<"ol">;
  /** Additional children rendered inside ToastRegion.Region. */
  children?: SeidrChild | SeidrChild[];
}

// ============================================================================
// Individual Toast Item Types
// ============================================================================

export interface UseToastOptions {
  /** Unique DOM element ID for the toast. */
  id?: string;
  /** The numeric toast ID provided by `toaster`. */
  toastId: number;
  /** Optional parent region coordinator. */
  region?: UseToastRegionResult;
  /** Localized strings for the toast. */
  translations?: ToastIntlTranslations;
  /**
   * Accessibility sensitivity of the toast.
   * `"high"` -> `aria-live="assertive"`, `"low"` -> `aria-live="polite"`.
   * @default "high"
   */
  priority?: ReactiveValue<ToastPriority>;
  /**
   * Time in milliseconds before automatically closing the toast.
   * Overrides the region duration.
   */
  duration?: ReactiveValue<number | undefined>;
  /**
   * Whether the toast should ignore duration and close only via user action.
   * @default false
   */
  persistent?: ReactiveValue<boolean>;
  /** Called when the dismiss timer is paused. */
  onPause?: () => void;
  /** Called when the dismiss timer is resumed. */
  onResume?: () => void;
  /** Called when starting a swipe gesture. */
  onSwipeStart?: (event: ToastSwipeEvent) => void;
  /** Called during a swipe gesture. */
  onSwipeMove?: (event: ToastSwipeEvent) => void;
  /** Called when a swipe gesture is cancelled. */
  onSwipeCancel?: (event: ToastSwipeEvent) => void;
  /** Called when a swipe gesture completes past threshold. */
  onSwipeEnd?: (event: ToastSwipeEvent) => void;
  /** Called when the Escape key is pressed while focused. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * Component semantic name for CSS annotations.
   * @default "toast"
   */
  dataComponent?: string;
}

export interface UseToastResult {
  /** Unique DOM ID for the toast root element. */
  id: string;
  /** Numeric toast ID from `toaster`. */
  toastId: number;
  /** Component semantic name for CSS annotations. */
  dataComponent: string;
  /** Localized strings. */
  translations: ToastIntlTranslations;
  /** Optional parent region coordinator. */
  region: UseToastRegionResult | undefined;
  /** Whether the toast is currently open. */
  isOpen: DerivedValue<boolean>;
  /** Priority ("high" | "low"). */
  priority: DerivedValue<ToastPriority>;
  /** Resolved duration in ms. */
  duration: DerivedValue<number>;
  /** Whether the toast is persistent. */
  isPersistent: DerivedValue<boolean>;
  /** Whether entrance animation is enabled (disabled on in-place updates). */
  isAnimationEnabled: DerivedValue<boolean>;
  /** Resolved swipe direction from region (or "right"). */
  swipeDirection: DerivedValue<ToastSwipeDirection>;
  /** Resolved swipe threshold from region (or 50). */
  swipeThreshold: DerivedValue<number>;
  /** Remaining lifetime percentage (100 down to 0). */
  lifeTime: DerivedValue<number>;
  /** Registered title element ID, if a Title subcomponent is present. */
  titleId: DerivedValue<string | undefined>;
  /** Registered description element ID, if a Description subcomponent is present. */
  descriptionId: DerivedValue<string | undefined>;
  /** Timestamp when the current timer started. */
  closeTimerStartTime: () => number;
  /** Closes and removes the toast. */
  close: () => void;
  /** Generates a scoped sub-element ID. */
  generateId: (part: string) => string;
  /** Registers the title element ID and returns a cleanup function. */
  registerTitleId: (id: string) => () => void;
  /** Registers the description element ID and returns a cleanup function. */
  registerDescriptionId: (id: string) => () => void;
  /** Swipe and keyboard callbacks. */
  onSwipeStart?: (event: ToastSwipeEvent) => void;
  onSwipeMove?: (event: ToastSwipeEvent) => void;
  onSwipeCancel?: (event: ToastSwipeEvent) => void;
  onSwipeEnd?: (event: ToastSwipeEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export interface ToastSubcomponentProps {
  /** The internal Toast coordinator instance. */
  instance?: UseToastResult;
  id?: string;
  style?: ReactiveStyleDeclaration;
  role?: string;
  tabIndex?: ReactiveValue<number>;
  dataComponent?: string;
  ariaLabel?: ReactiveValue<string | undefined>;
  "aria-label"?: ReactiveValue<string | undefined>;
  ariaLabelledBy?: ReactiveValue<string | undefined>;
  "aria-labelledby"?: ReactiveValue<string | undefined>;
  ariaDescribedBy?: ReactiveValue<string | undefined>;
  "aria-describedby"?: ReactiveValue<string | undefined>;
}

export type ToastRootProps<T extends keyof SeidrElementTagNameMap = "li"> = SeidrElementProps<T> &
  ToastSubcomponentProps & {
    as?: T;
  };

export type ToastTitleProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ToastSubcomponentProps & {
    as?: T;
  };

export type ToastDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ToastSubcomponentProps & {
    as?: T;
  };

export type ToastCloseButtonProps<T extends keyof SeidrElementTagNameMap = "button"> = ButtonProps<T> &
  ToastSubcomponentProps & {
    ariaLabel?: ReactiveValue<string | undefined>;
    "aria-label"?: ReactiveValue<string | undefined>;
  };

export type ToastProgressTrackProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ToastSubcomponentProps & {
    as?: T;
  };

export type ToastProgressFillProps<T extends keyof SeidrElementTagNameMap = "div"> = SeidrElementProps<T> &
  ToastSubcomponentProps & {
    as?: T;
  };

export type ToastInstance = UseToastResult & {
  Root: <T extends keyof SeidrElementTagNameMap = "li">(
    props?: ToastRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Title: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ToastTitleProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ToastDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  CloseButton: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: ToastCloseButtonProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ProgressTrack: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ToastProgressTrackProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ProgressFill: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: ToastProgressFillProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
};

export interface ToastProps extends UseToastOptions {
  /** Polymorphic tag name for the root element. Defaults to "li". */
  as?: keyof SeidrElementTagNameMap;
  /** Accessible title content for the toast. */
  title?: SeidrChild | SeidrChild[];
  /** Optional description content for the toast. */
  description?: SeidrChild | SeidrChild[];
  /**
   * Whether to render a close button, or custom close button label/icon content.
   * @default true
   */
  closeButton?: boolean | SeidrChild | SeidrChild[];
  /**
   * Whether to render the progress track and fill bar.
   * @default false
   */
  showProgress?: boolean;
  /** Props passed directly to Toast.Root. */
  rootProps?: ToastRootProps<"li">;
  /** Props passed directly to Toast.Title. */
  titleProps?: ToastTitleProps<"div">;
  /** Props passed directly to Toast.Description. */
  descriptionProps?: ToastDescriptionProps<"div">;
  /** Props passed directly to Toast.CloseButton. */
  closeButtonProps?: ToastCloseButtonProps<"button">;
  /** Props passed directly to Toast.ProgressTrack. */
  progressTrackProps?: ToastProgressTrackProps<"div">;
  /** Props passed directly to Toast.ProgressFill. */
  progressFillProps?: ToastProgressFillProps<"div">;
  /** Additional children rendered inside Toast.Root. */
  children?: SeidrChild | SeidrChild[];
}

