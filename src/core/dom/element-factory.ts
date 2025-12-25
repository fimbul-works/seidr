import { $, type ReactiveARIAMixin, type ReactiveProps, type SeidrElement, type SeidrNode } from "./element.js";

/**
 * Creates a specialized HTML element creator function for a specific tag type.
 *
 * This higher-order function generates type-safe element creators that provide
 * full TypeScript IntelliSense support and automatic type inference. Each created
 * function is optimized for creating elements of a specific HTML tag type.
 *
 * The resulting function supports reactive props, children elements, and maintains
 * the same API as $ but with tag-specific type safety.
 *
 * @template K extends keyof HTMLElementTagNameMap - The HTML tag name
 *
 * @param {K} tagName - The HTML tag name to create a specialized factory for
 * @param {Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>} [initialProps] - Optional default props to apply to all created elements
 * @returns {((
 *   options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
 *   children?: SeidrNode[],
 * ) => HTMLElementTagNameMap[K] & SeidrElement)} A specialized function that creates elements of the specified type
 *
 * @example
 * Creating specialized element factories
 * ```typescript
 * import { $factory } from '@fimbul-works/seidr';
 *
 * // Without default props
 * const div = $factory('div');
 * const input = $factory('input');
 * const button = $factory('button');
 *
 * // With default props
 * const $checkbox = $factory('input', { type: 'checkbox' });
 * const $primaryButton = $factory('button', { className: 'btn-primary' });
 * ```
 *
 * @example
 * Basic element creation
 * ```typescript
 * // These are equivalent to $('tagName', ...)
 * const container = div({ className: 'container' });
 * const textField = input({ type: 'text', placeholder: 'Enter name' });
 * const submitBtn = button({ textContent: 'Submit' });
 * ```
 *
 * @example
 * With default props
 * ```typescript
 * // Checkbox with type pre-configured
 * const $checkbox = $factory('input', { type: 'checkbox' });
 * const agreeCheckbox = $checkbox({ id: 'agree', checked: true });
 *
 * // Button with default styles
 * const $primaryButton = $factory('button', { className: 'btn btn-primary' });
 * const submitBtn = $primaryButton({ textContent: 'Submit' });
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
 * const divFactory = $factory('div');
 * const buttonFactory = $factory('button');
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
 * const div = $factory('div');
 * const ul = $factory('ul');
 * const li = $factory('li');
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
 * const input = $factory('input');
 * const canvas = $factory('canvas');
 * const video = $factory('video');
 *
 * // Full type safety and IntelliSense for tag-specific attributes
 * const searchField = input({
 *   type: 'search',
 *   placeholder: 'Search...',
 *   autocomplete: 'off',
 *   maxLength: 50, // TypeScript knows this is number for HTMLInputElement
 *   required: true  // TypeScript knows this is boolean for HTMLInputElement
 * });
 * ```
 *
 * @example
 * Custom element factories for frequently used patterns
 * ```typescript
 * import { $factory, Seidr } from '@fimbul-works/seidr';
 *
 * // Create reusable factories
 * const $div = $factory('div');
 * const $button = $factory('button');
 * const $input = $factory('input');
 * const $span = $factory('span');
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
 */
export function $factory<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  initialProps?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]>>,
): (
  options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> | ReactiveARIAMixin>,
  children?: SeidrNode[],
) => HTMLElementTagNameMap[K] & SeidrElement {
  return (
    options?: Partial<ReactiveProps<K, HTMLElementTagNameMap[K]> | ReactiveARIAMixin>,
    children?: SeidrNode[],
  ): HTMLElementTagNameMap[K] & SeidrElement => {
    const mergedProps = initialProps ? { ...initialProps, ...options } : options;
    return $(tagName, mergedProps, children);
  };
}
