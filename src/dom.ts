import { bind } from "./reactive.js";
import { ObservableValue } from "./value.js";

/** Allowed child nodes for HTMLElement */
export type SeidrNode = SeidrElement | HTMLElement | Text;

/**
 * Additional HTML element extra functionality
 */
export interface SeidrElement extends HTMLElement {
  on<E extends keyof HTMLElementEventMap>(
    event: E,
    handler: (ev: HTMLElementEventMap[E]) => any,
    options?: boolean | AddEventListenerOptions,
  ): ReturnType<typeof on>;
  destroy(): void;
}

/**
 * Creates an HTML element with the specified tag name, properties, and children.
 *
 * This is the core element creation function that handles property assignment and child appending.
 * If `options` is an array and `children` is undefined, `options` will be treated as children.
 *
 * @template K - The HTML tag name (e.g., 'div', 'input', 'span')
 * @param {K} tagName - The HTML tag name to create
 * @param {Partial<HTMLElementTagNameMap[K]>} [props] - Element properties to assign
 * @param {SeidrNode[]} [children] - Child elements to append
 * @returns {HTMLElementTagNameMap[K]} The created and configured HTML element
 */
export const makeEl = <K extends keyof HTMLElementTagNameMap, P extends keyof HTMLElementTagNameMap[K]>(
  tagName: K,
  props?: Partial<HTMLElementTagNameMap[K]>,
  children?: (SeidrNode | (() => SeidrNode))[],
): HTMLElementTagNameMap[K] & SeidrElement => {
  const el = document.createElement(tagName);
  const cleanups: (() => void)[] = [];

  // Assign properties
  if (props) {
    for (const [prop, value] of Object.entries(props)) {
      if (value instanceof ObservableValue) {
        cleanups.push(bind(value, el, (value, el) => (el[prop as P] = value)));
      } else {
        el[prop as P] = value;
      }
    }
  }

  // Add extra features
  Object.assign(el, {
    on<E extends keyof HTMLElementEventMap>(
      event: E,
      handler: (ev: HTMLElementEventMap[E]) => any,
      options?: boolean | AddEventListenerOptions,
    ) {
      return on(el, event, handler, options);
    },
    destroy() {
      Array.from(el.children).forEach((child: any) => child.destroy?.());
      el.remove();
      cleanups.forEach((cleanup) => cleanup());
    },
  });

  // Append children
  if (Array.isArray(children)) {
    children.forEach((child) => el.appendChild(typeof child === "function" ? child() : child));
  }

  return el as HTMLElementTagNameMap[K] & SeidrElement;
};

/**
 * Higher-order function that creates specialized element creator functions.
 *
 * Returns a function that creates HTML elements of the specified tag type with full TypeScript
 * type inference and IntelliSense support. Use this to create shorthand functions like
 * `div()`, `input()`, `span()`, etc.
 *
 * @template K - The HTML tag name (e.g., 'div', 'input', 'span')
 * @param {K} tagName - The HTML tag name for the specialized creator function
 * @returns {Function} A function that creates elements of the specified tag type
 *
 * @example
 * // Create specialized element creators
 * const div = el('div');
 * const input = el('input');
 * const button = el('button');
 *
 * @example
 * // Use the specialized creators
 * const container = div({ className: 'container' }, [
 *   input({ type: 'text', placeholder: 'Name' }),
 *   button({ textContent: 'Submit', onclick: () => console.log('clicked') })
 * ]);
 */
export const el = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): ((
  options?: Partial<HTMLElementTagNameMap[K]>,
  children?: SeidrNode[],
) => HTMLElementTagNameMap[K] & SeidrElement) => {
  return (
    options?: Partial<HTMLElementTagNameMap[K]>,
    children?: SeidrNode[],
  ): HTMLElementTagNameMap[K] & SeidrElement => makeEl(tagName, options, children);
};

/**
 * Adds an event listener to an element and returns a cleanup function.
 *
 * @param el - The target element
 * @param event - The event type
 * @param handler - The event handler function
 * @param options - Optional event listener options
 * @returns A function that removes the event listener when called
 */
export const on = <K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  el.addEventListener(event, handler as EventListener, options);
  return () => el.removeEventListener(event, handler as EventListener, options);
};

/**
 * Call HTMLElement.querySelector
 * @template T - HTMLElement to expect
 * @param query - Query string
 * @param el - Element to query from (default: document.body)
 * @returns {T | null} First element matching the query string
 */
export const $ = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T | null =>
  el.querySelector(query);

/**
 * Call HTMLElement.querySelectorAll
 * @template T - HTMLElement to expect
 * @param query - Query string
 * @param el - Element to query from (default: document.body)
 * @returns {Array<T>} An array of elements matching the query string
 */
export const $$ = <T extends HTMLElement>(query: string, el: HTMLElement = document.body): T[] =>
  Array.from(el.querySelectorAll(query));

export const AEl = el("a");
export const AbbrEl = el("abbr");
export const AddressEl = el("address");
export const AreaEl = el("area");
export const ArticleEl = el("article");
export const AsideEl = el("aside");
export const AudioEl = el("audio");
export const BEl = el("b");
export const BaseEl = el("base");
export const BdiEl = el("bdi");
export const BdoEl = el("bdo");
export const BlockquoteEl = el("blockquote");
export const BodyEl = el("body");
export const BrEl = el("br");
export const ButtonEl = el("button");
export const CanvasEl = el("canvas");
export const CaptionEl = el("caption");
export const CiteEl = el("cite");
export const CodeEl = el("code");
export const ColEl = el("col");
export const ColgroupEl = el("colgroup");
export const DataEl = el("data");
export const DatalistEl = el("datalist");
export const DdEl = el("dd");
export const DelEl = el("del");
export const DetailsEl = el("details");
export const DfnEl = el("dfn");
export const DialogEl = el("dialog");
export const DivEl = el("div");
export const DlEl = el("dl");
export const DtEl = el("dt");
export const EmEl = el("em");
export const EmbedEl = el("embed");
export const FieldsetEl = el("fieldset");
export const FigcaptionEl = el("figcaption");
export const FigureEl = el("figure");
export const FooterEl = el("footer");
export const FormEl = el("form");
export const H1El = el("h1");
export const H2El = el("h2");
export const H3El = el("h3");
export const H4El = el("h4");
export const H5El = el("h5");
export const H6El = el("h6");
export const HeadEl = el("head");
export const HeaderEl = el("header");
export const HgroupEl = el("hgroup");
export const HrEl = el("hr");
export const HtmlEl = el("html");
export const IEl = el("i");
export const IframeEl = el("iframe");
export const ImgEl = el("img");
export const InputEl = el("input");
export const InsEl = el("ins");
export const KbdEl = el("kbd");
export const LabelEl = el("label");
export const LegendEl = el("legend");
export const LiEl = el("li");
export const LinkEl = el("link");
export const MainEl = el("main");
export const MapEl = el("map");
export const MarkEl = el("mark");
export const MenuEl = el("menu");
export const MetaEl = el("meta");
export const MeterEl = el("meter");
export const NavEl = el("nav");
export const NoscriptEl = el("noscript");
export const ObjectEl = el("object");
export const OlEl = el("ol");
export const OptgroupEl = el("optgroup");
export const OptionEl = el("option");
export const OutputEl = el("output");
export const PEl = el("p");
export const PictureEl = el("picture");
export const PreEl = el("pre");
export const ProgressEl = el("progress");
export const QEl = el("q");
export const RpEl = el("rp");
export const RtEl = el("rt");
export const RubyEl = el("ruby");
export const SEl = el("s");
export const SampEl = el("samp");
export const ScriptEl = el("script");
export const SearchEl = el("search");
export const SectionEl = el("section");
export const SelectEl = el("select");
export const SlotEl = el("slot");
export const SmallEl = el("small");
export const SourceEl = el("source");
export const SpanEl = el("span");
export const StrongEl = el("strong");
export const StyleEl = el("style");
export const SubEl = el("sub");
export const SummaryEl = el("summary");
export const SupEl = el("sup");
export const TableEl = el("table");
export const TbodyEl = el("tbody");
export const TdEl = el("td");
export const TemplateEl = el("template");
export const TextareaEl = el("textarea");
export const TfootEl = el("tfoot");
export const ThEl = el("th");
export const TheadEl = el("thead");
export const TimeEl = el("time");
export const TitleEl = el("title");
export const TrEl = el("tr");
export const TrackEl = el("track");
export const UEl = el("u");
export const UlEl = el("ul");
export const VarEl = el("var");
export const VideoEl = el("video");
export const WbrEl = el("wbr");

export const TextNode = (text: string) => document.createTextNode(text);
