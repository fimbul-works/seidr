import { isObj } from "@fimbul-works/hvat";
import { $, type SeidrChild, type SeidrElementProps } from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "./constants";

/**
 * Creates a visually hidden span element.
 *
 * @param {SeidrChild | SeidrChild[]} children Children to render.
 * @param {SeidrElementProps<"span">} [props] Additional props to pass to the span element.
 * @returns {SeidrElement} A visually hidden span element.
 */
export function VisuallyHidden(
  children: SeidrChild | SeidrChild[],
  props?: SeidrElementProps<"span">,
): HTMLSpanElement {
  return $(
    "span",
    {
      ...props,
      style: isObj(props?.style)
        ? {
            ...VISUALLY_HIDDEN_STYLES,
            ...props?.style,
          }
        : VISUALLY_HIDDEN_STYLES,
    },
    children,
  );
}
