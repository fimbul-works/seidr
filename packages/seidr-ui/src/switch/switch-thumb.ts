import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseSwitchResult } from "./types.js";

export interface SwitchThumbOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit switch instance providing reactive state.
   */
  instance?: UseSwitchResult;
}

export type SwitchThumbProps<T extends keyof SeidrElementTagNameMap = "div"> = SwitchThumbOptions<T> &
  SeidrElementProps<T>;

/**
 * The thumb that is used to visually indicate whether the switch is on or off.
 * Remains mounted permanently and slides across the control track based on data-checked.
 */
export function SwitchThumb<T extends keyof SeidrElementTagNameMap = "div">(
  props: SwitchThumbProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: sw, id, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchThumb requires an instance prop");
  }

  return $(
    as as T,
    {
      id: id ?? sw.id.as((base: string) => `${base}-thumb`),
      ref: sw.thumbRef,
      ...sw.dataset,
      dataComponent: "switch",
      dataPart: "thumb",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
