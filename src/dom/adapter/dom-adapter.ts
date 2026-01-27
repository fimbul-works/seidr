export const createDOMAdapter = () => {
  return {
    createElement(tag: string) {
      return document.createElement(tag);
    },
    createTextNode(text: string) {
      return document.createTextNode(text);
    },
    createComment(text: string) {
      return document.createComment(text);
    },
    createDocumentFragment() {
      return document.createDocumentFragment();
    },
    createPortal(element: Node, container: Node) {
      container.appendChild(element);
      return element;
    },
  };
};
