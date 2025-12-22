import { createElement, type ReactiveProps, type SeidrElement, type SeidrNode } from "./element.js";

/**
 * Creates a specialized HTML element creator function for a specific tag type.
 *
 * This higher-order function generates type-safe element creators that provide
 * full TypeScript IntelliSense support and automatic type inference. Each created
 * function is optimized for creating elements of a specific HTML tag type.
 *
 * The resulting function supports reactive props, children elements, and maintains
 * the same API as createElement but with tag-specific type safety.
 *
 * @template K extends keyof HTMLElementTagNameMap - The HTML tag name
 *
 * @param tagName - The HTML tag name to create a specialized factory for
 *
 * @returns A specialized function that creates elements of the specified type
 *
 * @example
 * Creating specialized element factories
 * ```typescript
 * import { elementFactory } from '@fimbul-works/seidr';
 *
 * // Create specialized creators
 * const div = elementFactory('div');
 * const input = elementFactory('input');
 * const button = elementFactory('button');
 * const form = elementFactory('form');
 * const canvas = elementFactory('canvas');
 * ```
 *
 * @example
 * Basic element creation
 * ```typescript
 * // These are equivalent to createElement(tagName, ...)
 * const container = div({ className: 'container' });
 * const textField = input({ type: 'text', placeholder: 'Enter name' });
 * const submitBtn = button({ textContent: 'Submit' });
 * const myForm = form({}, [textField, submitBtn]);
 * ```
 *
 * @example
 * With reactive props
 * ```typescript
 * import { Seidr } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(false);
 * const counter = new Seidr(0);
 *
 * const divFactory = elementFactory('div');
 * const buttonFactory = elementFactory('button');
 *
 * const statusDisplay = divFactory({
 *   className: 'status',
 *   textContent: counter.as(c => `Count: ${c}`),
 *   style: counter.as(c => `opacity: ${c > 10 ? 0.5 : 1}`)
 * });
 *
 * const toggleButton = buttonFactory({
 *   textContent: 'Toggle',
 *   disabled: isActive,
 *   onclick: () => isActive.value = !isActive.value
 * });
 * ```
 *
 * @example
 * With children elements
 * ```typescript
 * const div = elementFactory('div');
 * const ul = elementFactory('ul');
 * const li = elementFactory('li');
 *
 * const list = div({ className: 'list-container' }, [
 *   ul({ className: 'items' }, [
 *     li({ textContent: 'Item 1' }),
 *     li({ textContent: 'Item 2' }),
 *     li({ textContent: 'Item 3' })
 *   ])
 * ]);
 * ```
 *
 * @example
 * Type-specific attributes with full IntelliSense
 * ```typescript
 * const input = elementFactory('input');
 * const canvas = elementFactory('canvas');
 * const video = elementFactory('video');
 *
 * // Full type safety and IntelliSense for tag-specific attributes
 * const searchField = input({
 *   type: 'search',
 *   placeholder: 'Search...',
 *   autocomplete: 'off',
 *   maxLength: 50, // TypeScript knows this is number for HTMLInputElement
 *   required: true  // TypeScript knows this is boolean for HTMLInputElement
 * });
 *
 * const drawingCanvas = canvas({
 *   width: 800,      // TypeScript knows this is number for HTMLCanvasElement
 *   height: 600,     // TypeScript knows this is number for HTMLCanvasElement
 *   style: 'border: 1px solid black;'
 * });
 *
 * const videoPlayer = video({
 *   controls: true,  // TypeScript knows this is boolean for HTMLVideoElement
 *   autoplay: false, // TypeScript knows this is boolean for HTMLVideoElement
 *   loop: true       // TypeScript knows this is boolean for HTMLVideoElement
 * });
 * ```
 *
 * @example
 * Custom element factories for frequently used patterns
 * ```typescript
 * import { elementFactory, Seidr } from '@fimbul-works/seidr';
 *
 * // Create reusable factories
 * const $div = elementFactory('div');
 * const $button = elementFactory('button');
 * const $input = elementFactory('input');
 * const $span = elementFactory('span');
 * const $form = elementFactory('form');
 *
 * // Use them throughout your application
 * const createCounter = (initial = 0) => {
 *   const count = new Seidr(initial);
 *
 *   return $div({ className: 'counter' }, [
 *     $span({ textContent: count.as(c => `Count: ${c}`) }),
 *     $button({
 *       textContent: '+',
 *       onclick: () => count.value++
 *     }),
 *     $button({
 *       textContent: '-',
 *       onclick: () => count.value--
 *     })
 *   ]);
 * };
 * ```
 *
 * @since 1.0.0
 *
 * @see createElement - The underlying element creation function
 * @see ReactiveProps - Type definitions for reactive properties
 * @see SeidrElement - Enhanced HTMLElement interface
 *
 * @returns A function with signature:
 * ```typescript
 * (
 *   options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
 *   children?: SeidrNode[]
 * ) => HTMLElementTagNameMap[K] & SeidrElement
 * ```
 */
export const elementFactory = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): (
  options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
  children?: SeidrNode[],
) => HTMLElementTagNameMap[K] & SeidrElement => {
  return (
    options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
    children?: SeidrNode[],
  ): HTMLElementTagNameMap[K] & SeidrElement => createElement(tagName, options, children);
};
