import type { SeidrComponent } from "../component";
import { getDOMFactory } from "../dom-factory";
import { getRenderContext } from "../render-context";
import { unwrapSeidr } from "../seidr";
import { camelToKebab } from "../ssr/dom";
import type { CleanupFunction } from "../types";
import {
  isBool,
  isEmpty,
  isFn,
  isNum,
  isSeidr,
  isSeidrComponent,
  isSeidrFragment,
  isStr,
  isUndefined,
} from "../util/type-guards";
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
  const domFactory = getDOMFactory();

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
    const el = domFactory.createElement(tagName);
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
      el.dataset[SEIDR_ID_CAME_CASE] = elementId;
    }

    // Process props and register bindings
    if (props) {
      for (const [prop, value] of Object.entries(props)) {
        if (prop === DATA_SEIDR_ID) {
          // Skip the data-seidr-id prop itself
          continue;
        }

        let target: any = el;
        let effectiveProp = prop;
        let useAttribute = prop.startsWith("aria-") || prop.startsWith("data-");

        if (!useAttribute) {
          if (prop.startsWith("data") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
            target = el.dataset;
            effectiveProp = prop[4].toLowerCase() + prop.slice(5);
          } else if (prop.startsWith("aria") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
            if (!(prop in el)) {
              effectiveProp = camelToKebab(prop);
              useAttribute = true;
            }
          }
        }

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
            const styleObj = value as any;
            for (const [styleProp, styleValue] of Object.entries(styleObj)) {
              // Handle reactive style values
              if (isSeidr(styleValue)) {
                cleanups.push(
                  styleValue.bind(el, (val, element) => {
                    element.style.setProperty(styleProp, String(val));
                  }),
                );
              } else {
                el.style.setProperty(styleProp, String(styleValue));
              }
            }
          }
          continue;
        }

        // Set up reactive binding
        if (isSeidr(value)) {
          cleanups.push(
            value.bind(el, (val, _element) => {
              if (useAttribute) {
                val === null ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, String(val));
              } else {
                target[effectiveProp] = val;
              }
            }),
          );
        } else {
          if (useAttribute) {
            el.setAttribute(effectiveProp, value as string);
          } else {
            target[effectiveProp] = value;
          }
        }
      }
    }

    // Process children
    if (Array.isArray(children)) {
      children.forEach((child) => {
        const item = unwrapSeidr(isFn(child) ? (child as any)() : child);

        // Skip null/undefined/false
        if (isEmpty(item) || isBool(item)) return;

        const node = (isSeidrComponent(item) ? item.element : item) as any;
        if (isNum(node)) {
          el.appendChild($text(node));
        } else {
          if (isSeidrFragment(node)) {
            // Use appendTo to handle fragment logic (moving markers and nodes)
            node.appendTo(el as any);
          } else if (node) {
            el.appendChild(node);
          }
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
  const el = domFactory.createElement(tagName);
  let cleanups: CleanupFunction[] = [];
  if (typeof process !== "undefined" && typeof elementId !== "undefined") {
    el.dataset[SEIDR_ID_CAME_CASE] = elementId;
  }

  // Store original HTMLElement.remove function
  const domRemove = el.remove.bind(el);

  // Assign properties
  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      let target: any = el;
      let effectiveProp = prop;
      let useAttribute = prop.startsWith("aria-") || prop.startsWith("data-");

      if (!useAttribute) {
        if (prop.startsWith("data") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
          target = el.dataset;
          effectiveProp = prop[4].toLowerCase() + prop.slice(5);
        } else if (prop.startsWith("aria") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
          if (!(prop in el)) {
            effectiveProp = camelToKebab(prop);
            useAttribute = true;
          }
        }
      }

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
          value.bind(el, (val, _element) => {
            if (useAttribute) {
              val === null ? el.removeAttribute(effectiveProp) : el.setAttribute(effectiveProp, val as string);
            } else {
              target[effectiveProp] = val;
            }
          }),
        );
      } else {
        // For non-Seidr values
        if (useAttribute && value !== null && value !== undefined) {
          el.setAttribute(effectiveProp, value as any);
        } else {
          target[effectiveProp] = value;
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
          if (isEmpty(item) || isBool(item)) return;

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
            if (item.scope.onAttached) {
              item.scope.onAttached(el);
            }
          } else if (isStr(item) || isNum(item)) {
            newNode = $text(item);
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
      if (isEmpty(item) || isBool(item)) return;

      if (isSeidrFragment(item)) {
        item.appendTo(el);
        // if (item.scope?.onAttached) item.scope.onAttached(el); // SeidrFragment is not a component, and thus has no scope!
      } else if (isSeidrComponent(item)) {
        if (isSeidrFragment(item.element)) {
          item.element.appendTo(el);
        } else {
          el.appendChild(item.element);
        }
        if (item.scope.onAttached) item.scope.onAttached(el);
      } else {
        el.appendChild(isStr(item) || isNum(item) ? $text(item) : (item as Node));
      }
    });
  }

  return el as unknown as SeidrElement<K>;
}

/**
 * Creates a new DOM Text node.
 * @param {unknown} text - String to convert into Dom Text node
 * @returns {Text} DOM Text node
 */
export const $text = (text: unknown): Text => {
  const domFactory = getDOMFactory();
  return domFactory.createTextNode(String(text));
};

/**
 * Creates a new DOM Comment node.
 * @param {string} text - String to convert into Dom Comment node
 * @returns {Comment} DOM Comment node
 */
export const $comment = (text: string): Comment => {
  const domFactory = getDOMFactory();
  return domFactory.createComment(text);
};
