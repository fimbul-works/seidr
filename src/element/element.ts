import type { SeidrComponent } from "../component";
import { getRenderContext } from "../render-context";
import { unwrapSeidr } from "../seidr";
import { ServerComment, ServerHTMLElement } from "../ssr/dom/server-html-element";
import type { CleanupFunction } from "../types";
import { isFn, isSeidr, isSeidrComponent, isSeidrFragment, isStr, isUndefined } from "../util/type-guards";
import type { SeidrElement, SeidrElementInterface, SeidrElementProps, SeidrNode } from "./types";

/**
 * Creates an HTML element with automatic reactive binding capabilities.
 *
 * When a property value is a Seidr instance, it automatically creates a reactive
 * binding that updates the DOM property whenever the observable changes. Plain
 * values are assigned once without creating bindings.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template {keyof HTMLElementTagNameMap[K]} P - Property type inference (internal use)
 *
 * @param {K} tagName - The HTML tag name to create
 * @param {SeidrElementProps<K>} [props] - Element properties supporting reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Child elements or functions returning elements
 * @returns {SeidrElement<K>} A Seidr-enhanced HTML element with additional methods
 * @throws {Error} When attempting to use reserved properties ('on', 'clear', 'destroy')
 */
export function $<K extends keyof HTMLElementTagNameMap, P extends keyof HTMLElementTagNameMap[K]>(
  tagName: K,
  props?: SeidrElementProps<K>,
  children?: (SeidrNode | (() => SeidrNode))[],
): SeidrElement<K> {
  // Helper function to check props for a Seidr instance
  const hasSeidrBindings = () => {
    // No props passed
    if (!props) {
      return false;
    }

    // Iterate
    for (const [prop, value] of Object.entries(props)) {
      if (isSeidr(value)) {
        return true;
      }

      // Check for SeidrElement properties
      if (["on", "clean", "remove"].includes(prop)) {
        throw new Error(`Unallowed property "${prop}"`);
      }
    }

    return false;
  };

  // Server-side rendering check: window === undefined || process.env.SEIDR_TEST_SSR === true
  const isServerSide = typeof window === "undefined" || (typeof process !== "undefined" && process.env.SEIDR_TEST_SSR);

  // Reuse the string
  const SEIDR_ID = "seidr-id";
  const SEIDR_ID_CAME_CASE = "seidrId"; // HTMLElement expects camelCase
  const DATA_SEIDR_ID = `data-${SEIDR_ID}`;

  // RenderContext for data-seidr-id
  const ctx = getRenderContext();

  // Handle SSR element
  if (isServerSide) {
    const el = new ServerHTMLElement(tagName, {}, []);
    let cleanups: CleanupFunction[] = [];

    // Properties that should be set directly on the element
    const directProps = new Set<string>([
      "id",
      "className",
      "textContent",
      "innerHTML",
      "value",
      "checked",
      "disabled",
      "readonly",
      "required",
      "type",
      "href",
      "src",
      "style",
    ]);

    // If element has Seidr bindings, assign ID
    let elementId: string | undefined;
    if (hasSeidrBindings()) {
      elementId = String(ctx!.idCounter++);
      el.dataset[SEIDR_ID] = elementId;
    }

    // Process props and register bindings
    if (props) {
      for (const [prop, value] of Object.entries(props)) {
        if (prop === DATA_SEIDR_ID) {
          // Skip the data-seidr-id prop itself
          continue;
        }

        // Set up reactive binding
        if (isSeidr(value)) {
          cleanups.push(
            value.bind(el, (value, element) =>
              directProps.has(prop) ? ((element as any)[prop] = value) : element.setAttribute(prop, String(value)),
            ),
          );
        } else {
          if (directProps.has(prop)) {
            (el as any)[prop] = value;
          } else {
            el.setAttribute(prop, value);
          }
        }
      }
    }

    // Process children
    if (Array.isArray(children)) {
      children.forEach((child) => {
        const item = unwrapSeidr(isFn(child) ? (child as any)() : child);

        // Skip null/undefined/false
        if (item === null || item === undefined || item === false || item === true) return;

        const node = (isSeidrComponent(item) ? item.element : item) as any;

        // Special handling for Router/SSR wrapper: if node has _ssrWrapper,
        // append all its children instead of just the node itself
        if (node?._ssrWrapper) {
          const wrapper = node._ssrWrapper;
          // Move all children from wrapper to this element
          for (const c of [...wrapper.children]) {
            el.appendChild(c);
          }
        } else if (typeof node === "number") {
          el.appendChild(String(node));
        } else if (isSeidrFragment(node)) {
          // In SSR, fragments are serialized with markers
          el.appendChild(node);
        } else if (node) {
          el.appendChild(node);
        }

        if (isSeidrComponent(item) && item.scope.onAttached) {
          item.scope.onAttached(el as any);
        }
      });
    }

    // Store cleanup method
    const originalRemove = el.remove.bind(el);
    el.remove = () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      originalRemove();
    };

    // @ts-expect-error
    return el;
  }

  // Client-side handling

  // During hydration, we don't assign new IDs - we only match SSR elements
  let elementId: string | undefined;
  if (typeof process !== "undefined" && hasSeidrBindings() && ctx && !isUndefined(ctx.ctxID)) {
    elementId = String(ctx.idCounter++);
  }

  // Create a new HTMLElement if not found
  const el = document.createElement(tagName);
  let cleanups: CleanupFunction[] = [];
  if (typeof process !== "undefined" && typeof elementId !== "undefined") {
    el.dataset[SEIDR_ID_CAME_CASE] = elementId;
  }

  // Store original HTMLElement.remove function
  const domRemove = el.remove.bind(el);

  // Assign properties
  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      // For aria-* and data-* attributes, use setAttribute
      const useAttribute = prop.startsWith("aria-") || prop.startsWith("data-");
      // Special handling for style object
      if (prop === "style") {
        // CSS style string
        if (isStr(value)) {
          if (isSeidr(value)) {
            cleanups.push(value.bind(el, (val, element) => (element.style = val as string)));
          } else if (value !== null && value !== undefined) {
            el.style = value;
          }
        } else if (typeof value === "object" && value !== null) {
          // Style object
          const styleObj = value as Partial<CSSStyleDeclaration>;
          for (const [styleProp, styleValue] of Object.entries(styleObj)) {
            // Handle reactive style values
            if (isSeidr(styleValue)) {
              cleanups.push(
                styleValue.bind(el, (val, element) => {
                  (element.style as any)[styleProp] = val;
                }),
              );
            } else {
              (el.style as any)[styleProp] = styleValue;
            }
          }
        }
      } else if (isSeidr(value)) {
        // Set up reactive binding
        cleanups.push(
          value.bind(el, (value, element) => {
            if (useAttribute) {
              value === null ? element.removeAttribute(prop) : element.setAttribute(prop, value as string);
            } else {
              (element as any)[prop] = value;
            }
          }),
        );
      } else {
        // For non-Seidr values
        if (useAttribute && value !== null && value !== undefined) {
          el.setAttribute(prop, value as any);
        } else {
          el[prop as P] = value as HTMLElementTagNameMap[K][P];
        }
      }
    }
  }

  // Add extra features
  Object.assign(el, {
    get isSeidrElement() {
      return true;
    },
    on<E extends keyof HTMLElementEventMap>(
      event: E,
      handler: (ev: HTMLElementEventMap[E]) => any,
      options?: boolean | AddEventListenerOptions,
    ): CleanupFunction {
      el.addEventListener(event, handler as EventListener, options);
      return () => el.removeEventListener(event, handler as EventListener, options);
    },
    clear(): void {
      Array.from(el.children).forEach((child: any) => child.remove());
    },
    remove(): void {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      this.clear();
      domRemove();
    },
  } as SeidrElementInterface);

  // Append children
  if (Array.isArray(children)) {
    children.forEach((child) => {
      const initialItem = isFn(child) ? child() : child;

      // Handle reactive child (Seidr)
      if (isSeidr(initialItem)) {
        const anchor = $text("");
        el.appendChild(anchor);

        let currentNode: Node | null = null;
        let currentComponent: SeidrComponent | null = null;

        const update = (val: any) => {
          // Cleanup previous
          if (currentComponent) {
            currentComponent.destroy();
            currentComponent = null;
          }
          if (currentNode?.parentNode) {
            currentNode.parentNode.removeChild(currentNode);
            currentNode = null;
          }

          // Unwrap if nested function? (Optional, but good for safety)
          const item = isFn(val) ? val() : val;

          // Skip if null/undefined/boolean
          if (item === null || item === undefined || item === false || item === true) return;

          let newNode: Node;
          if (isSeidrFragment(item)) {
            // Append markers and nodes
            const fragment = item;
            if (anchor.parentNode) {
              anchor.parentNode.insertBefore(fragment.start, anchor);
              anchor.parentNode.insertBefore(fragment.end, anchor);
              // Store start marker as "currentNode" for reference if needed,
              // though fragments manage their own range.
              currentNode = fragment.start;
            }
            // if (item.scope?.onAttached) item.scope.onAttached(el); // SeidrFragmnet is not a component, and thus has no scope!
          } else if (isSeidrComponent(item)) {
            newNode = item.element as Node;
            currentComponent = item;
            if (item.scope.onAttached) item.scope.onAttached(el);
          } else if (isStr(item) || typeof item === "number") {
            newNode = $text(String(item));
          } else {
            newNode = item as Node;
          }

          if (newNode!) {
            currentNode = newNode;
            if (anchor.parentNode) {
              anchor.parentNode.insertBefore(newNode, anchor);
            }
          }
        };

        // Bind update to Seidr
        cleanups.push(initialItem.bind(el, (val) => update(val)));
        return;
      }

      // Handle static child
      const item = initialItem;
      // Skip null/undefined/boolean static children
      if (item === null || item === undefined || item === false || item === true) return;

      if (isSeidrFragment(item)) {
        item.append(el);
        // if (item.scope?.onAttached) item.scope.onAttached(el); // SeidrFragment is not a component, and thus has no scope!
      } else if (isSeidrComponent(item)) {
        if (isSeidrFragment(item.element)) {
          item.element.append(el);
        } else {
          el.appendChild(item.element);
        }
        if (item.scope.onAttached) item.scope.onAttached(el);
      } else {
        el.appendChild(isStr(item) || typeof item === "number" ? $text(String(item)) : (item as Node));
      }
    });
  }

  return el as unknown as SeidrElement<K>;
}

/**
 * Creates a new DOM Text node.
 * @param {string} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: string): Text => document.createTextNode(text);

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  if (typeof window === "undefined" || (typeof process !== "undefined" && process.env.SEIDR_TEST_SSR)) {
    return new ServerComment(text) as any;
  }
  return document.createComment(text);
};
