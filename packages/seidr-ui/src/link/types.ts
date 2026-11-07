import type {
  ObservableValue,
  ReactiveValue,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export type AriaCurrentType =
  | "page"
  | "step"
  | "location"
  | "date"
  | "time"
  | "true"
  | "false"
  | boolean;

export interface LinkOptions<T extends keyof SeidrElementTagNameMap = "a"> {
  /**
   * The destination URL to navigate to.
   */
  href: ReactiveValue<string | URL>;

  /**
   * The HTML element tag name to render.
   * @default "a"
   */
  as?: T;

  /**
   * Whether the link is disabled.
   * When disabled, native navigation is blocked and aria-disabled="true" is set.
   * @default false
   */
  disabled?: ReactiveValue<boolean>;

  /**
   * Whether the link URL matching must be exact to be considered active.
   * @default false
   */
  exact?: boolean;

  /**
   * Class name to apply to the element.
   */
  className?: ReactiveValue<string | undefined>;

  /**
   * Class name to apply when the link is active.
   */
  activeClass?: ReactiveValue<string | undefined>;

  /**
   * Class name to apply when the link is inactive.
   */
  inactiveClass?: ReactiveValue<string | undefined>;

  /**
   * The aria-current attribute value to apply when active (default: "page").
   * Set to false to disable.
   * @default "page"
   */
  ariaCurrent?:
    | AriaCurrentType
    | ObservableValue<AriaCurrentType | undefined | null>;
}

export type LinkProps<T extends keyof SeidrElementTagNameMap = "a"> = LinkOptions<T> &
  Omit<SeidrElementProps<T>, keyof LinkOptions<T>>;

