import { getComponentScope } from "../component/component-scope.js";
import { getDocument } from "../dom/get-document.js";
import type { Ref } from "../observable/types.js";
import { getHydrationContext } from "../ssr/hydrate/hydration-context.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import type { HydrationMismatchNode } from "../ssr/hydrate/types.js";
import { isClient } from "../util/environment/is-client.js";
import { isServer } from "../util/environment/is-server.js";
import { assignProps } from "./assign-props.js";
import type { ReactiveStyleDeclaration, ReactiveValue } from "./types.js";
import type { SVGAttributes } from "./types.svg.js";

export type SvgIconProps = Omit<Partial<SVGAttributes>, "className" | "style" | "ref"> & {
  className?: ReactiveValue<string | undefined>;
  style?: ReactiveValue<string | ReactiveStyleDeclaration | undefined> | ReactiveStyleDeclaration;
  ref?: Ref<SVGSVGElement>;
  [key: string]: any;
};

export type SvgIconFactory = (props?: SvgIconProps) => SVGSVGElement;

/**
 * Extracts attributes from an opening SVG tag string into a key-value record.
 *
 * @param {string} attrString - String of attributes inside `<svg ...>`
 * @returns {Record<string, string>} Parsed attributes
 */
export function parseSvgAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(attrString)) !== null) {
    const name = m[1];
    const val = m[2] ?? m[3] ?? m[4] ?? "";
    attrs[name] = val;
  }
  return attrs;
}

/**
 * Creates an SVG icon component factory from raw SVG markup.
 * Uses template cloning on the client for maximum performance with zero wrapper elements,
 * and renders clean SSRElements in server-side rendering mode.
 *
 * @param {string} rawSvgMarkup - The raw SVG string
 * @returns {SvgIconFactory} An element factory that creates the SVG node
 */
export function createSvgIcon(rawSvgMarkup: string): SvgIconFactory {
  let template: HTMLTemplateElement | undefined;
  let baseAttrs: Record<string, string> = {};
  let innerContent = "";

  const cleaned = rawSvgMarkup
    .replace(/<\?xml[\s\S]*?\?>/i, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  const match = cleaned.match(/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/i);
  if (match) {
    baseAttrs = parseSvgAttributes(match[1]);
    innerContent = match[2];
  }

  return function SvgIcon(props?: SvgIconProps): SVGSVGElement {
    // 1. Server-Side Rendering
    if (isServer()) {
      const doc = getDocument();
      const el = doc.createElement("svg") as unknown as SVGSVGElement;

      const scope = getComponentScope();
      scope?.trackChild?.(el as any);

      const mergedProps = props ? { ...baseAttrs, ...props } : baseAttrs;
      assignProps(el as any, mergedProps as any);
      (el as any).innerHTML = innerContent;

      return el;
    }

    // 2. Client Hydration
    if (isHydrating()) {
      const hydrationContext = getHydrationContext();
      if (hydrationContext && !hydrationContext.isMismatched()) {
        const claimed = hydrationContext.claim<SVGSVGElement>("svg");
        if (claimed && !(claimed as unknown as HydrationMismatchNode).isHydrationMismatch) {
          if (props) {
            assignProps(claimed as any, props as any);
          }
          return claimed;
        }
      }
    }

    // 3. Client Normal Render (cloneNode from pre-parsed template)
    if (!template && isClient()) {
      const doc = getDocument();
      template = doc.createElement("template");
      template.innerHTML = cleaned;
    }

    const node = template?.content?.firstElementChild;
    const el = node
      ? (node.cloneNode(true) as SVGSVGElement)
      : (getDocument().createElement("svg") as unknown as SVGSVGElement);

    if (props) {
      assignProps(el as any, props as any);
    }

    return el;
  };
}
