import type { AnchorRect, BasePlacement, Placement } from "./types.js";

/**
 * Creates a DOMRect object, supporting environments where DOMRect constructor is unavailable.
 */
export function createDOMRect(anchorRect?: AnchorRect): DOMRect {
  const { x = 0, y = 0, width = 0, height = 0 } = anchorRect ?? {};

  if (typeof DOMRect === "function") {
    return new DOMRect(x, y, width, height);
  }

  const rect = {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
  };

  return { ...rect, toJSON: () => rect } as DOMRect;
}

/**
 * Creates a virtual reference element compatible with Floating UI.
 */
export function getAnchorElement(
  anchor: HTMLElement | null | undefined,
  getAnchorRect?: (anchor?: HTMLElement) => AnchorRect | undefined,
) {
  const contextElement = anchor ?? undefined;

  return {
    contextElement,
    getBoundingClientRect: () => {
      const anchorRect = getAnchorRect?.(anchor ?? undefined);

      if (anchorRect) {
        return createDOMRect(anchorRect);
      }

      if (anchor) {
        return anchor.getBoundingClientRect();
      }

      return createDOMRect();
    },
  };
}

/**
 * Validates whether a given string is a valid Popper placement.
 */
export function isValidPlacement(placement: string): placement is Placement {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(placement);
}

const REVERSE_BASE_PLACEMENT: Record<BasePlacement, BasePlacement> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

/**
 * Computes CSS transform-origin matching current placement and text direction.
 */
export function getTransformOrigin(placement: Placement, readingDirection: string = "ltr"): string {
  const [basePlacement, alignment] = placement.split("-") as [BasePlacement, "start" | "end" | undefined];

  const reversePlacement = REVERSE_BASE_PLACEMENT[basePlacement];

  if (!alignment) {
    return `${reversePlacement} center`;
  }

  if (basePlacement === "left" || basePlacement === "right") {
    return `${reversePlacement} ${alignment === "start" ? "top" : "bottom"}`;
  }

  if (alignment === "start") {
    return `${reversePlacement} ${readingDirection === "rtl" ? "right" : "left"}`;
  }

  return `${reversePlacement} ${readingDirection === "rtl" ? "left" : "right"}`;
}

export const ROTATION_DEG = {
  top: 180,
  right: -90,
  bottom: 0,
  left: 90,
} as const;

export const ARROW_PATH =
  "M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z";

