import { createComponent } from "@fimbul-works/seidr";
import { $code, $pre } from "@fimbul-works/seidr/html";
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', typescript);

export const CodeBlock = createComponent((code: string) => {
  return $pre(
    { className: "code-block" },
    $code({ className: "language-typescript", innerHTML: hljs.highlight(code, { language: 'typescript' }).value }),
  );
}, "CodeBlock");
