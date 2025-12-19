/**
 * Server-side DOM utilities that mirror the client-side API
 * but generate HTML strings instead of actual DOM elements.
 */
type Attributes = Record<string, string | number | boolean | null | undefined>;

export interface ServerElement {
  tagName: string;
  attributes: Attributes;
  children: (ServerElement | string)[];
  toString(): string;
}

export class ServerHTMLElement implements ServerElement {
  constructor(
    public tagName: string,
    public attributes: Attributes = {},
    public children: (ServerElement | string)[] = [],
  ) {}

  toString(): string {
    const attrs = Object.entries(this.attributes)
      .filter(([_, value]) => value != null && value !== false)
      .map(([key, value]) => {
        if (value === true) return key;
        // Convert className to class for HTML
        const attrName = key === "className" ? "class" : key;
        return `${attrName}="${escapeHtml(String(value))}"`;
      })
      .join(" ");

    const openTag = attrs ? `<${this.tagName} ${attrs}>` : `<${this.tagName}>`;

    // Self-closing tags
    const voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"];
    if (voidElements.includes(this.tagName)) {
      return openTag.replace(">", " />");
    }

    const childHtml = this.children.map((child) => (typeof child === "string" ? escapeHtml(child) : child.toString())).join("");

    return `${openTag}${childHtml}</${this.tagName}>`;
  }
}

/**
 * Escape special HTML characters.
 * @param text - Text to escape special characters from
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Server-side element creator that mirrors the client-side API
 */
export const makeElServer = <K extends string>(tagName: K, props?: Attributes, children?: (ServerElement | string)[]): ServerElement => new ServerHTMLElement(tagName, { ...props }, children || []);

/**
 * Higher-order function that creates specialized server element creator functions.
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
export const elServer = <K extends string>(tagName: K) => {
  return (props?: Attributes, children?: (ServerElement | string)[]): ServerElement => makeElServer(tagName, props, children);
};

export const AEl = elServer("a");
export const AbbrEl = elServer("abbr");
export const AddressEl = elServer("address");
export const AreaEl = elServer("area");
export const ArticleEl = elServer("article");
export const AsideEl = elServer("aside");
export const AudioEl = elServer("audio");
export const BEl = elServer("b");
export const BaseEl = elServer("base");
export const BdiEl = elServer("bdi");
export const BdoEl = elServer("bdo");
export const BlockquoteEl = elServer("blockquote");
export const BodyEl = elServer("body");
export const BrEl = elServer("br");
export const ButtonEl = elServer("button");
export const CanvasEl = elServer("canvas");
export const CaptionEl = elServer("caption");
export const CiteEl = elServer("cite");
export const CodeEl = elServer("code");
export const ColEl = elServer("col");
export const ColgroupEl = elServer("colgroup");
export const DataEl = elServer("data");
export const DatalistEl = elServer("datalist");
export const DdEl = elServer("dd");
export const DelEl = elServer("del");
export const DetailsEl = elServer("details");
export const DfnEl = elServer("dfn");
export const DialogEl = elServer("dialog");
export const DivEl = elServer("div");
export const DlEl = elServer("dl");
export const DtEl = elServer("dt");
export const EmEl = elServer("em");
export const EmbedEl = elServer("embed");
export const FieldsetEl = elServer("fieldset");
export const FigcaptionEl = elServer("figcaption");
export const FigureEl = elServer("figure");
export const FooterEl = elServer("footer");
export const FormEl = elServer("form");
export const H1El = elServer("h1");
export const H2El = elServer("h2");
export const H3El = elServer("h3");
export const H4El = elServer("h4");
export const H5El = elServer("h5");
export const H6El = elServer("h6");
export const HeadEl = elServer("head");
export const HeaderEl = elServer("header");
export const HgroupEl = elServer("hgroup");
export const HrEl = elServer("hr");
export const HtmlEl = elServer("html");
export const IEl = elServer("i");
export const IframeEl = elServer("iframe");
export const ImgEl = elServer("img");
export const InputEl = elServer("input");
export const InsEl = elServer("ins");
export const KbdEl = elServer("kbd");
export const LabelEl = elServer("label");
export const LegendEl = elServer("legend");
export const LiEl = elServer("li");
export const LinkEl = elServer("link");
export const MainEl = elServer("main");
export const MapEl = elServer("map");
export const MarkEl = elServer("mark");
export const MenuEl = elServer("menu");
export const MetaEl = elServer("meta");
export const MeterEl = elServer("meter");
export const NavEl = elServer("nav");
export const NoscriptEl = elServer("noscript");
export const ObjectEl = elServer("object");
export const OlEl = elServer("ol");
export const OptgroupEl = elServer("optgroup");
export const OptionEl = elServer("option");
export const OutputEl = elServer("output");
export const PEl = elServer("p");
export const PictureEl = elServer("picture");
export const PreEl = elServer("pre");
export const ProgressEl = elServer("progress");
export const QEl = elServer("q");
export const RpEl = elServer("rp");
export const RtEl = elServer("rt");
export const RubyEl = elServer("ruby");
export const SEl = elServer("s");
export const SampEl = elServer("samp");
export const ScriptEl = elServer("script");
export const SearchEl = elServer("search");
export const SectionEl = elServer("section");
export const SelectEl = elServer("select");
export const SlotEl = elServer("slot");
export const SmallEl = elServer("small");
export const SourceEl = elServer("source");
export const SpanEl = elServer("span");
export const StrongEl = elServer("strong");
export const StyleEl = elServer("style");
export const SubEl = elServer("sub");
export const SummaryEl = elServer("summary");
export const SupEl = elServer("sup");
export const TableEl = elServer("table");
export const TbodyEl = elServer("tbody");
export const TdEl = elServer("td");
export const TemplateEl = elServer("template");
export const TextareaEl = elServer("textarea");
export const TfootEl = elServer("tfoot");
export const ThEl = elServer("th");
export const TheadEl = elServer("thead");
export const TimeEl = elServer("time");
export const TitleEl = elServer("title");
export const TrEl = elServer("tr");
export const TrackEl = elServer("track");
export const UEl = elServer("u");
export const UlEl = elServer("ul");
export const VarEl = elServer("var");
export const VideoEl = elServer("video");
export const WbrEl = elServer("wbr");

export const TextNode = (text: string) => text;

/**
 * Server-side component interface
 */
export interface ServerComponent<T> {
  html: string;
  hydrationData?: T;
}

/**
 * Create a server-rendered component
 */
export function serverComponent<T>(factory: () => ServerElement, hydrationData?: T): ServerComponent<T> {
  return {
    html: factory().toString(),
    hydrationData,
  };
}
