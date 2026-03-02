import { isFn } from "../../util/type-guards/primitive-types";
import { type HydrationTarget, hydrationMap } from "./node-map";

/**
 * Checks if two nodes match.
 * @param {Node} real - The real node
 * @param {Node} fake - The fake node
 * @returns {boolean} True if the nodes match
 */
const nodeMatches = (real: Node, fake: Node): boolean => {
  if (real.nodeType !== fake.nodeType) return false;
  if (real.nodeType === Node.ELEMENT_NODE) {
    return (real as HTMLElement).tagName.toLowerCase() === (fake as HTMLElement).tagName.toLowerCase();
  }
  return true; // text/comments match by type
};

const isWhitespaceTextNode = (node: Node): boolean => {
  return node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === "";
};

/**
 * Transfers event listeners from one element to another.
 * @param {HTMLElement} real - The real element
 * @param {HTMLElement} fake - The fake element
 */
const transferEventListeners = (real: HTMLElement, fake: HTMLElement): void => {
  for (const key in fake) {
    if (key.startsWith("on") && isFn(fake[key as keyof typeof fake])) {
      (real as any)[key] = fake[key as keyof typeof real];
    }
  }
};

/**
 * Syncs text content between two nodes.
 * @param {Text | Comment} real - The real text node
 * @param {Text | Comment} fake - The fake text node
 */
const syncTextNode = (real: Text | Comment, fake: Text | Comment): void => {
  if (real.textContent !== fake.textContent) {
    console.warn(
      `[Hydration mismatch] WHAT: Text content difference. Expected '${fake.textContent}' but found '${real.textContent}'.\n` +
        `HOW: The client rendered different text than the server.\n` +
        `WHERE: Text mapping on ${fake.parentElement?.tagName || "TextNode"}.\n` +
        `WHY: This usually happens when state that is rendered as text changes between SSR and client mounting.\n` +
        `ACTION: Syncing real DOM text content to match client text content.`,
      { real, fake },
    );
    real.textContent = fake.textContent;
  }
};

/**
 * Hydrates an existing server-rendered node with a dynamically created client-side structure.
 * @param {Node} real - The real DOM node
 * @param {Node} fake - The fake DOM node
 */
export const hydrateNode = (real: Node, fake: Node): void => {
  // Mark this node as actively hydrating its children
  (real as HydrationTarget).__hydration_index = 0;

  // Track the relationship for reactive updates
  hydrationMap.set(fake, real);

  if (real.nodeType === Node.ELEMENT_NODE && fake.nodeType === Node.ELEMENT_NODE) {
    transferEventListeners(real as HTMLElement, fake as HTMLElement);
  } else if (
    (real.nodeType === Node.TEXT_NODE && fake.nodeType === Node.TEXT_NODE) ||
    (real.nodeType === Node.COMMENT_NODE && fake.nodeType === Node.COMMENT_NODE)
  ) {
    syncTextNode(real as Text | Comment, fake as Text | Comment);
  }

  // Recursively map existing fake children to real children
  const fakeChildren = Array.from(fake.childNodes);
  let realIdx = 0;

  for (const fakeChild of fakeChildren) {
    let realChild = real.childNodes[realIdx];

    if (!isWhitespaceTextNode(fakeChild)) {
      while (realChild && isWhitespaceTextNode(realChild)) {
        realIdx++;
        realChild = real.childNodes[realIdx];
      }
    }

    if (realChild && nodeMatches(realChild, fakeChild)) {
      hydrateNode(realChild, fakeChild);
      realIdx++;
    } else {
      console.warn(
        `[Hydration mismatch] WHAT: Deep child node structure difference detected.\n` +
          `HOW: The client-rendered tree contains different children than the SSR-rendered tree.\n` +
          `WHERE: Deep mismatch while processing children of <${(real as HTMLElement).tagName || "Text"}>.\n` +
          `WHY: This usually happens when conditional rendering logic differs between server and client passes.\n` +
          `ACTION: Reverting to client-side replacement by unmounting the SSR tree and replacing with client nodes.`,
        { realChild, fakeChild },
      );
      if (realChild) {
        real.replaceChild(fakeChild, realChild);
      } else {
        real.appendChild(fakeChild);
      }
      realIdx++;
    }
  }
};

/**
 * Attempts to consume a pre-existing server-rendered child node instead of appending a new one.
 * If unmatched, gracefully bails out.
 *
 * @param {HydrationTarget} parent - The server DOM parent node processing hydration.
 * @param {Node} childNode - The client-rendered node looking for its SSR counterpart.
 * @returns {boolean} True if successfully matched/intercepted.
 */
export const consumeHydrationNode = (parent: HydrationTarget, childNode: Node): boolean => {
  let childIndex = parent.__hydration_index || 0;
  let realChild = parent.childNodes[childIndex];

  if (!isWhitespaceTextNode(childNode)) {
    while (realChild && isWhitespaceTextNode(realChild)) {
      childIndex++;
      realChild = parent.childNodes[childIndex];
    }
  }

  if (realChild && nodeMatches(realChild, childNode)) {
    hydrateNode(realChild, childNode);
    parent.__hydration_index = childIndex + 1;
    return true;
  }

  console.warn(
    `[Hydration mismatch] WHAT: Expected matching child node, but found unmatched node.\n` +
      `HOW: The client tried to hydrate <${(childNode as HTMLElement).tagName || "Text"}>, but the SSR tree did not provide a match.\n` +
      `WHERE: Top-level or component root hydration at index ${childIndex} of parent <${(parent as HTMLElement).tagName || "Document"}>.\n` +
      `WHY: This occurs when components inject extra root nodes only on the client, or SSR omits nodes unexpectedly.\n` +
      `ACTION: Replacing the mismatched SSR node or appending the new client node.`,
    { childNode, expectedRealChild: realChild },
  );

  if (realChild) {
    parent.replaceChild(childNode, realChild);
  } else {
    parent.appendChild(childNode);
  }

  // Advance hydration index anyway to keep syncing next siblings
  parent.__hydration_index = childIndex + 1;
  return true;
};
