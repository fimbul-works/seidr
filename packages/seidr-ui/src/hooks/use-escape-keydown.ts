import {
  type CleanupFunction,
  getComponentScope,
  isFn,
  isNullish,
  isServer,
  isValue,
  onMounted,
  onUnmounted,
  SeidrError,
  unwrapValue,
  type Value,
} from "@fimbul-works/seidr";

/**
 * Callback function for Escape keydown events.
 */
export type EscapeKeydownHandler = (event: KeyboardEvent) => void;

/**
 * Listens for Escape keydown events with proper listener cleanup and owner-document scoping.
 *
 * If `onEscapeKeyDown` is nullish (`undefined` or `null`), this is a no-op and returns a no-op cleanup function.
 * If `onEscapeKeyDown` is a reactive `Value`, listeners are dynamically attached and detached based on whether
 * the Value currently contains an active handler.
 *
 * @param {EscapeKeydownHandler | Value<EscapeKeydownHandler | undefined | null>} onEscapeKeyDown - Handler callback or reactive Value invoked when the Escape key is pressed.
 * @param {Document | Value<Document | null> | null} [ownerDocument] - Target document to listen on (defaults to global document).
 * @returns {CleanupFunction} A cleanup function that detaches the listener.
 * @throws {SeidrError} If onEscapeKeyDown or ownerDocument is provided with an invalid type.
 *
 * Ported from https://github.com/radix-ui/primitives/blob/main/packages/react/use-escape-keydown/src/use-escape-keydown.tsx
 * MIT License, Copyright (c) WorkOS.
 */
export function useEscapeKeydown(
  onEscapeKeyDown: EscapeKeydownHandler | Value<EscapeKeydownHandler | undefined | null>,
  ownerDocument?: Document | Value<Document | null> | null,
): CleanupFunction {
  if (isServer()) {
    return () => {};
  }

  if (!isFn(onEscapeKeyDown) && !isValue(onEscapeKeyDown)) {
    throw new SeidrError("Invalid onEscapeKeyDown callback");
  }

  if (
    !isNullish(unwrapValue(ownerDocument)) &&
    !isFn(unwrapValue(ownerDocument)?.addEventListener) &&
    !isFn(unwrapValue(ownerDocument)?.removeEventListener)
  ) {
    throw new SeidrError("Invalid ownerDocument");
  }

  let isCleanedUp = false;
  let activeDetach: CleanupFunction | null = null;
  let unwatchDoc: CleanupFunction | null = null;
  let unwatchHandler: CleanupFunction | null = null;

  const cleanup: CleanupFunction = () => {
    if (isCleanedUp) {
      return;
    }

    isCleanedUp = true;

    if (activeDetach) {
      activeDetach();
      activeDetach = null;
    }

    if (unwatchDoc) {
      unwatchDoc();
      unwatchDoc = null;
    }

    if (unwatchHandler) {
      unwatchHandler();
      unwatchHandler = null;
    }
  };

  const syncListener = () => {
    if (activeDetach) {
      activeDetach();
      activeDetach = null;
    }

    if (isCleanedUp) {
      return;
    }

    const handler = unwrapValue(onEscapeKeyDown);
    if (!isFn(handler)) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => (event.key === "Escape" || event.key === "Esc") && handler(event);

    const doc = unwrapValue(ownerDocument) ?? document;
    doc.addEventListener("keydown", handleKeyDown, { capture: true });
    activeDetach = () => doc.removeEventListener("keydown", handleKeyDown, { capture: true });
  };

  const resolveAndAttach = () => {
    if (isCleanedUp) {
      return;
    }

    syncListener();

    if (isValue(ownerDocument)) {
      unwatchDoc = ownerDocument.watch(() => !isCleanedUp && syncListener());
    }

    if (isValue(onEscapeKeyDown)) {
      unwatchHandler = onEscapeKeyDown.watch(() => !isCleanedUp && syncListener());
    }
  };

  if (process.env.VITEST) {
    const component = getComponentScope();
    if (component) {
      component.onMounted(resolveAndAttach);
      component.onUnmounted(cleanup);
    } else {
      resolveAndAttach();
    }
  } else {
    onMounted(resolveAndAttach);
    onUnmounted(cleanup);
  }

  return cleanup;
}

// Export alias
export { useEscapeKeydown as useEscapeKeyDown };
