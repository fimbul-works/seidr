import { $, isObj, type SeidrChild, type SeidrElementProps } from "@fimbul-works/seidr";

/**
 * Lifted from https://github.com/radix-ui/primitives/blob/main/packages/react/visually-hidden/src/visually-hidden.tsx
 * MIT License, Copyright (c) WorkOS.
 */
const VISUALLY_HIDDEN_STYLES = {
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal",
} as const;

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
