/**
 * Lifted from https://github.com/radix-ui/primitives/blob/main/packages/react/visually-hidden/src/visually-hidden.tsx
 * MIT License, Copyright (c) WorkOS.
 */
export const VISUALLY_HIDDEN_STYLES = {
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
