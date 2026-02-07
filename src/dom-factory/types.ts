/**
 * Interface for creating DOM elements.
 *
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 * @template EType - The type of element to create
 * @template TType - The type of text node to create
 * @template CType - The type of comment to create
 */
export interface DOMFactory<
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
  EType extends HTMLElementTagNameMap[K] = HTMLElementTagNameMap[K],
  TType extends Text = Text,
  CType extends Comment = Comment,
> {
  createElement(tag: K, options?: ElementCreationOptions): EType;
  createTextNode(data: string): TType;
  createComment(data: string): CType;
  getDocument(): Document;
}
