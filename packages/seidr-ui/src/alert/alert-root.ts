import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export interface AlertRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
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

export type AlertRootProps<T extends keyof SeidrElementTagNameMap = "div"> = AlertRootOptions<T> &
  Omit<SeidrElementProps<T>, "role">;

/**
 * Alert displays a brief, important message in a way that attracts the user's attention
 * without interrupting the user's task.
 */
export function AlertRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function AlertRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: AlertRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function AlertRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: AlertRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: AlertRootProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as AlertRootProps<T>) ?? ({} as AlertRootProps<T>);
    content = children;
  } else {
    props = {} as AlertRootProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "div" as T, role = "alert", ...rest } = props;
  return $(
    as as keyof SeidrElementTagNameMap,
    { role, ...rest } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}

export const Alert = Object.assign(AlertRoot, {
  Root: AlertRoot,
});
