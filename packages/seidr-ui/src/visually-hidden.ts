import { isObj } from "@fimbul-works/hvat";
import { $, resolvePropsAndChildren, type SeidrChild, type SeidrElementProps } from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "./constants.js";

/**
 * Creates a visually hidden span element.
 *
 * @param {SeidrElementProps<"span">} [props] Additional props to pass to the span element.
 * @param {SeidrChild | SeidrChild[]} [children] Children to render.
 * @returns {HTMLSpanElement} A visually hidden span element.
 */
export function VisuallyHidden(children?: SeidrChild | SeidrChild[]): HTMLSpanElement;
export function VisuallyHidden(
  props?: SeidrElementProps<"span"> | null,
  children?: SeidrChild | SeidrChild[],
): HTMLSpanElement;
export function VisuallyHidden(
  propsOrChildren?: SeidrElementProps<"span"> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): HTMLSpanElement {
  const [props, content] = resolvePropsAndChildren<SeidrElementProps<"span">>(propsOrChildren, children);

  const { style, ...rest } = props;

  return $(
    "span",
    {
      ...rest,
      style: isObj(style)
        ? {
            ...VISUALLY_HIDDEN_STYLES,
            ...style,
          }
        : VISUALLY_HIDDEN_STYLES,
    },
    content,
  );
}
