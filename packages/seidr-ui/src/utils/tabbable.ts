import { contains, getActiveElement, isFrame } from "./dom.js";

const focusableElements = [
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "area[href]",
  "[tabindex]",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
];

const tabbableElements = [...focusableElements, '[tabindex]:not([tabindex="-1"]):not([disabled])'];

export const FOCUSABLE_ELEMENT_SELECTOR = `${focusableElements.join(
  ":not([hidden]),",
)},[tabindex]:not([disabled]):not([hidden])`;

export const TABBABLE_ELEMENT_SELECTOR = tabbableElements.join(':not([hidden]):not([tabindex="-1"]),');

/**
 * Returns all the tabbable elements in `container`.
 */
export function getAllTabbableIn(container: HTMLElement, includeContainer?: boolean) {
  const tabbableElements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR)).filter(
    isTabbable,
  );

  if (includeContainer && isTabbable(container)) {
    tabbableElements.unshift(container);
  }

  tabbableElements.forEach((element, i) => {
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body;
      const allFrameTabbable = getAllTabbableIn(frameBody, false);
      tabbableElements.splice(i, 1, ...allFrameTabbable);
    }
  });

  return tabbableElements;
}

/**
 * Checks whether `element` is tabbable or not.
 * @example
 * isTabbable(document.querySelector("input")); // true
 * isTabbable(document.querySelector("input[tabindex='-1']")); // false
 * isTabbable(document.querySelector("input[hidden]")); // false
 * isTabbable(document.querySelector("input:disabled")); // false
 */
export function isTabbable(element: Element): element is HTMLElement {
  return isFocusable(element) && !hasNegativeTabIndex(element);
}

/**
 * Checks whether `element` is focusable or not.
 * @example
 * isFocusable(document.querySelector("input")); // true
 * isFocusable(document.querySelector("input[tabindex='-1']")); // true
 * isFocusable(document.querySelector("input[hidden]")); // false
 * isFocusable(document.querySelector("input:disabled")); // false
 */
export function isFocusable(element: Element): element is HTMLElement {
  return element.matches(FOCUSABLE_ELEMENT_SELECTOR) && isElementVisible(element);
}

function hasNegativeTabIndex(element: Element) {
  const tabIndex = Number.parseInt(element.getAttribute("tabindex") || "0", 10);
  return tabIndex < 0;
}

/**
 * Adapted from https://github.com/testing-library/jest-dom and
 * https://github.com/vuejs/vue-test-utils-next/.
 * Licensed under the MIT License.
 * @param element - Element to evaluate for display or visibility.
 */
export function isElementVisible(element: Element, childElement?: Element): boolean {
  return (
    element.nodeName !== "#comment" &&
    isStyleVisible(element) &&
    isAttributeVisible(element, childElement) &&
    (!element.parentElement || isElementVisible(element.parentElement, element))
  );
}

function isStyleVisible(element: Element) {
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
    return false;
  }

  const { display, visibility } = element.style;

  let isVisible = display !== "none" && visibility !== "hidden" && visibility !== "collapse";

  if (isVisible) {
    if (!element.ownerDocument.defaultView) {
      return isVisible;
    }

    const { getComputedStyle } = element.ownerDocument.defaultView;
    const { display: computedDisplay, visibility: computedVisibility } = getComputedStyle(element);

    isVisible = computedDisplay !== "none" && computedVisibility !== "hidden" && computedVisibility !== "collapse";
  }

  return isVisible;
}

function isAttributeVisible(element: Element, childElement?: Element) {
  return (
    !element.hasAttribute("hidden") &&
    (element.nodeName === "DETAILS" && childElement && childElement.nodeName !== "SUMMARY"
      ? element.hasAttribute("open")
      : true)
  );
}

/**
 * Checks if `element` has focus within.
 * Elements that are referenced by `aria-activedescendant` are also considered.
 * @example
 * hasFocusWithin(document.getElementById("id"));
 */
export function hasFocusWithin(element: Node | Element) {
  const activeElement = getActiveElement(element);

  if (!activeElement) {
    return false;
  }

  if (!contains(element, activeElement)) {
    const activeDescendant = activeElement.getAttribute("aria-activedescendant");
    if (!activeDescendant) {
      return false;
    }
    if (!("id" in element)) {
      return false;
    }
    if (activeDescendant === element.id) {
      return true;
    }
    return !!element.querySelector(`#${CSS.escape(activeDescendant)}`);
  }
  return true;
}
