import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  type ReactiveValue,
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
  props?: AlertProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Alert<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: AlertProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: AlertProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as AlertProps<T>) ?? ({} as AlertProps<T>);
    content = children;
  } else {
    props = {} as AlertProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "div" as T, role = "alert", ...rest } = props;
  return $(
    as as keyof SeidrElementTagNameMap,
    { role, ...rest } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
