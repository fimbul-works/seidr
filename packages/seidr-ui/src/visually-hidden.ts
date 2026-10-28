import { $, resolvePropsAndChildren, type SeidrChild, type SeidrElementProps } from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "./constants.js";
import { mergeStyleProps } from "@fimbul-works/seidr";

/**
 * Creates a visually hidden span element.
 *
 * @param {SeidrElementProps<"span">} [props] Additional props to pass to the span element.
 * @param {SeidrChild | SeidrChild[]} [children] Children to render.
 * @returns {HTMLSpanElement} A visually hidden span element.
 */
export function VisuallyHidden(children?: SeidrChild | SeidrChild[]): HTMLSpanElement;
export function VisuallyHidden(props: SeidrElementProps<"span">, children?: SeidrChild | SeidrChild[]): HTMLSpanElement;
export function VisuallyHidden(
  propsOrChildren?: SeidrElementProps<"span"> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): HTMLSpanElement {
  const [props, content] = resolvePropsAndChildren<SeidrElementProps<"span">>(propsOrChildren, children);
  const { style, ...rest } = props;

  return $(
    "span",
    {
      dataComponent: "visually-hidden",
      ...rest,
      style: mergeStyleProps(VISUALLY_HIDDEN_STYLES, style)
    },
    content,
  );
}
