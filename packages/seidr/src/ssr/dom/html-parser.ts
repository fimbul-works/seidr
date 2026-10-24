import { Parser } from "htmlparser2";
import { setDocumentProvider } from "../../dom/get-document.js";
import { getSSRDocument } from "../../dom/get-document.ssr.js";
import { $comment } from "../../dom/node/comment.js";
import { $text } from "../../dom/node/text.js";
import { $ } from "../../element/create-element.js";
import type { SeidrElementTagNameMap } from "../../element/types.js";
import { SELF_CLOSING } from "./ssr-element.js";

export type HTMLNode =
  | {
      type: "element";
      tag: string;
      attributes: Record<string, string>;
      children: HTMLNode[];
    }
  | {
      type: "text";
      value: string;
    }
  | {
      type: "comment";
      value: string;
    };

export function parseHTML(markup: string, xmlMode = false): HTMLNode[] {
  const start = performance.now();

  const root: HTMLNode[] = [];
  const stack: Array<{
    tag: string;
    attributes: Record<string, string>;
    children: HTMLNode[];
  }> = [];

  const current = () => stack.at(-1)?.children ?? root;

  const parser = new Parser(
    {
      onopentag(tag, attributes) {
        const node = {
          type: "element" as const,
          tag,
          attributes,
          children: [],
        };

        current().push(node);

        // htmlparser2 handles void elements without
        // waiting for a corresponding closing tag.
        if (!SELF_CLOSING.has(tag)) {
          stack.push(node);
        }
      },

      onclosetag(tag) {
        // A production implementation must match the
        // parser's implied-close and nesting behavior.
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].tag === tag) {
            stack.length = i;
            break;
          }
        }
      },

      ontext(value) {
        current().push({ type: "text", value });
      },

      oncomment(value) {
        current().push({ type: "comment", value });
      },
    },
    { xmlMode },
  );

  parser.end(markup);

  const delta = performance.now() - start;
  console.log(`parseHTML elapsed ${delta.toFixed(3)} ms`);

  return root;
}

export function htmlNodesToDOM(nodes: HTMLNode[]) {
  setDocumentProvider(getSSRDocument);

  const start = performance.now();

  const toSeidrNode = (node: HTMLNode): ChildNode | null => {
    switch (node.type) {
      case "element":
        if (node.tag === "script" || node.tag === "style") {
          const scriptOrStyle = $(node.tag as keyof SeidrElementTagNameMap, node.attributes);
          scriptOrStyle.innerHTML = node.children
            .filter((c) => c.type === "text")
            .map((c) => c.value)
            .join("");
          return scriptOrStyle;
        }
        return $(
          node.tag as keyof SeidrElementTagNameMap,
          node.attributes,
          node.children.map(toSeidrNode).filter(Boolean),
        );
      case "text":
        return $text(node.value);

      case "comment":
        return $comment(node.value);
    }
  };

  const result = nodes.map(toSeidrNode).filter(Boolean);

  const delta = performance.now() - start;
  console.log(`htmlNodesToDOM elapsed ${delta.toFixed(3)} ms`);

  return result;
}
