/**
 * Interface for creating DOM elements.
 * @template EType - The type of element to create
 * @template FType - The type of document fragment to create
 * @template TType - The type of text node to create
 * @template CType - The type of comment to create
 * @template {keyof HTMLElementTagNameMap} K - The HTML tag name from HTMLElementTagNameMap
 */
export interface DOMFactory<
  K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
  EType extends HTMLElementTagNameMap[K] = HTMLElementTagNameMap[K],
  FType extends DocumentFragment = DocumentFragment,
  TType extends Text = Text,
  CType extends Comment = Comment,
> {
  createElement(tag: K, options?: ElementCreationOptions): EType;
  createDocumentFragment(): FType;
  createTextNode(data: string): TType;
  createComment(data: string): CType;
}
