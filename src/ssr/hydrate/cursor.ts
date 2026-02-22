/**
 * Tracks the current position in the DOM during client-side hydration.
 */
export class HydrationCursor {
  private stack: (Node | null)[] = [];
  public current: Node | null = null;
  public failed: boolean = false;

  constructor(root: Node | null) {
    this.current = root;
  }

  /**
   * Called to descend into an element's children.
   */
  enter(node: Node | null): void {
    this.stack.push(this.current);
    this.current = node ? node.firstChild : null;
  }

  /**
   * Called after finishing an element's children, restoring the previous cursor.
   */
  exit(): void {
    if (this.stack.length > 0) {
      this.current = this.stack.pop() ?? null;
    }
  }

  /**
   * Attempts to claim an existing element node.
   * If there is a mismatch, hydration fails and the remaining siblings are removed.
   * @param {K} tagName - The tag name of the element to claim
   * @returns {HTMLElementTagNameMap[K] | null} The claimed element or null if hydration failed
   */
  claimElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] | null {
    if (this.failed || !this.current) return null;

    if (
      this.current.nodeType === Node.ELEMENT_NODE &&
      (this.current as HTMLElement).tagName.toLowerCase() === tagName.toLowerCase()
    ) {
      const node = this.current as HTMLElementTagNameMap[K];
      (node as any)._h = true;
      this.current = this.current.nextSibling;
      return node;
    }

    this.fail(`Expected element <${tagName.toLowerCase()}> but found ${this.getNodeDescription(this.current)}`);
    return null;
  }

  /**
   * Attempts to claim an existing text node.
   * @param {string} text - The text to claim
   * @returns {Text | null} The claimed text node or null if hydration failed
   */
  claimText(text: string): Text | null {
    if (this.failed || !this.current) return null;

    if (this.current.nodeType === Node.TEXT_NODE) {
      const node = this.current as Text;
      // Ensure the text matches the client expectation
      if (node.textContent !== String(text)) {
        node.textContent = String(text);
      }
      (node as any)._h = true;
      this.current = this.current.nextSibling;
      return node;
    }

    this.fail(`Expected text node for "${text}" but found ${this.getNodeDescription(this.current)}`);
    return null;
  }

  /**
   * Attempts to claim an existing comment node.
   * @param {string} text - The text to claim
   * @returns {Comment | null} The claimed comment node or null if hydration failed
   */
  claimComment(text: string): Comment | null {
    if (this.failed || !this.current) return null;

    if (this.current.nodeType === Node.COMMENT_NODE) {
      const node = this.current as Comment;
      if (node.textContent === text) {
        (node as any)._h = true;
        this.current = this.current.nextSibling;
        return node;
      }
    }

    this.fail(`Expected comment <!--${text}--> but found ${this.getNodeDescription(this.current)}`);
    return null;
  }

  /**
   * Fails hydration and cleans up remaining siblings.
   * @param {string} reason - The reason for hydration failure
   */
  private fail(reason: string): void {
    this.failed = true;
    console.warn(
      `Hydration mismatch: ${reason}. Bailing out of hydration for this branch and falling back to client rendering.`,
    );
    this.cleanupRemainingSiblings();
  }

  /**
   * Cleans up remaining siblings by removing them from the DOM.
   */
  private cleanupRemainingSiblings(): void {
    let node = this.current;
    while (node) {
      const next = node.nextSibling;
      node.parentNode?.removeChild(node);
      node = next;
    }
    this.current = null;
  }

  /**
   * Gets a description of the current node.
   * @param {Node | null} node - The node to describe
   * @returns {string} The description of the node
   */
  private getNodeDescription(node: Node | null): string {
    if (!node) return "null";
    if (node.nodeType === Node.ELEMENT_NODE) return `<${(node as HTMLElement).tagName.toLowerCase()}>`;
    if (node.nodeType === Node.TEXT_NODE) return `Text("${node.textContent}")`;
    if (node.nodeType === Node.COMMENT_NODE) return `<!--${node.textContent}-->`;
    return `Node(type: ${node.nodeType})`;
  }
}
