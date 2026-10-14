import {
  type EffectDependency,
  getDocument,
  isServer,
  isValue,
  unwrapValue,
  useEffect,
  type Value,
} from "@fimbul-works/seidr";

export type EscapeKeydownHandler = (event: KeyboardEvent) => void;

export interface UseEscapeKeyDownProps {
  /** Event handler called when the escape key is down. */
  onEscapeKeyDown?: EscapeKeydownHandler;

  /** Whether the escape key down events should be listened or not. */
  isDisabled?: boolean | Value<boolean>;

  /** The owner document to attach listeners to. */
  ownerDocument?: Document | Value<Document | undefined>;
}

/**
 * Listens for when the escape key is down on the document.
 * Direct document keydown listener, removing listener on unmount.
 *
 * Ported from Kobalte's createEscapeKeyDown primitive.
 */
export function useEscapeKeyDown(props: UseEscapeKeyDownProps): void {
  if (isServer()) {
    return;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" || event.key === "Esc") {
      props.onEscapeKeyDown?.(event);
    }
  };

  useEffect(() => {
    if (unwrapValue(props.isDisabled)) {
      return;
    }

    const doc = unwrapValue(props.ownerDocument) ?? getDocument();
    doc.addEventListener("keydown", handleKeyDown);

    return () => doc.removeEventListener("keydown", handleKeyDown);
  }, [props.isDisabled, props.ownerDocument].filter(isValue));
}

export { useEscapeKeyDown as useEscapeKeydown };
