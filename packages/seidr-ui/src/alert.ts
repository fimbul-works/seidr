import {
  $,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export interface AlertOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;
  /**
   * ARIA role for the alert container.
   * @default "alert"
   */
  role?: ReactiveValue<string>;
}

export type AlertProps<T extends keyof SeidrElementTagNameMap = "div"> = AlertOptions<T> &
  Omit<SeidrElementProps<T>, "role">;

/**
 * Alert displays a brief, important message in a way that attracts the user's attention
 * without interrupting the user's task.
 */
export function Alert<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Alert<T extends keyof SeidrElementTagNameMap = "div">(
  props: AlertProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Alert<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: AlertProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<AlertProps<T>>(propsOrChildren, children);

  const { as = "div" as T, role = "alert", ...rest } = props;
  return $(as as T, { role, ...rest } as SeidrElementProps<T>, content) as SeidrElementTagNameMap[T];
}
