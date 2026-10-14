import {
  type Ref,
  useEffect,
  type Value,
} from "@fimbul-works/seidr";

function isFormElement(
  element: HTMLElement,
): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement {
  return element.matches("textarea, input, select, button");
}

function getClosestForm(element: HTMLElement): HTMLFormElement | null {
  return isFormElement(element) ? element.form : element.closest("form");
}

/**
 * Listens for `reset` event on the closest `<form>` element and executes the given handler.
 * Cleans up automatically on component unmount or element detachment.
 *
 * Ported from Kobalte's createFormResetListener primitive.
 */
export function useFormResetListener(
  element: Ref<HTMLElement> | Value<HTMLElement | null | undefined>,
  handler: () => void,
): void {
  useEffect(() => {
    const el = element();
    if (!el) return;

    const form = getClosestForm(el);
    if (!form) return;

    form.addEventListener("reset", handler, { passive: true });

    return () => {
      form.removeEventListener("reset", handler);
    };
  }, [element]);
}
