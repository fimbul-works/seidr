import type { Observable } from "../observable/types.js";

/**
 * Covariant reactive wrapper for ARIA attribute values.
 * Accepts static values, `null`/`undefined` (attribute removal), and any reactive `Value` or `DerivedValue`.
 */
export type ReactiveARIAValue<T> = T | null | undefined | Observable<T | null | undefined>;

export type ARIABoolean = boolean | "true" | "false";
export type ARIAInt = number | `${number}`;
export type ARIADecimal = number | `${number}`;
export type ARIAIdRef = string;
export type ARIAIdRefs = string;
export type ARIARelevantToken = "additions" | "all" | "removals" | "text";
export type ARIARelevantValue = ARIARelevantToken | `${ARIARelevantToken} ${string}`;
export type ARIADropEffectToken = "copy" | "execute" | "link" | "move" | "none" | "popup";
export type ARIADropEffectValue = ARIADropEffectToken | `${ARIADropEffectToken} ${string}`;

/** Abstract WAI-ARIA superclass roles (12). Not intended for DOM `role` attributes. */
export type ARIAAbstractRole =
  | "command"
  | "composite"
  | "input"
  | "landmark"
  | "range"
  | "roletype"
  | "section"
  | "sectionhead"
  | "select"
  | "structure"
  | "widget"
  | "window";

/**
 * Concrete WAI-ARIA roles (88). Note: `"directory"` is deprecated in WAI-ARIA 1.2.
 * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Roles)
 */
export type ARIARole =
  | "alert"
  | "alertdialog"
  | "application"
  | "article"
  | "banner"
  | "blockquote"
  | "button"
  | "caption"
  | "cell"
  | "checkbox"
  | "code"
  | "columnheader"
  | "combobox"
  | "comment"
  | "complementary"
  | "contentinfo"
  | "definition"
  | "deletion"
  | "dialog"
  | "directory" // @deprecated
  | "document"
  | "emphasis"
  | "feed"
  | "figure"
  | "form"
  | "grid"
  | "gridcell"
  | "group"
  | "heading"
  | "image"
  | "img"
  | "insertion"
  | "link"
  | "list"
  | "listbox"
  | "listitem"
  | "log"
  | "main"
  | "mark"
  | "marquee"
  | "math"
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "meter"
  | "navigation"
  | "none"
  | "note"
  | "option"
  | "paragraph"
  | "presentation"
  | "progressbar"
  | "radio"
  | "radiogroup"
  | "region"
  | "row"
  | "rowgroup"
  | "rowheader"
  | "scrollbar"
  | "search"
  | "searchbox"
  | "sectionfooter"
  | "sectionheader"
  | "separator"
  | "slider"
  | "spinbutton"
  | "status"
  | "strong"
  | "subscript"
  | "suggestion"
  | "superscript"
  | "switch"
  | "tab"
  | "table"
  | "tablist"
  | "tabpanel"
  | "term"
  | "text"
  | "textbox"
  | "time"
  | "timer"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treegrid"
  | "treeitem";

export type ARIARoleName = ARIARole | ARIAAbstractRole;

/** All 54 standard kebab-case `aria-*` HTML attributes with strict reactive value types. */
export type ARIAKebabAttributes = {
  /**
   * Spec type: `idrefs` · global.
   * [WAI-ARIA Reference](https://w3c.github.io/aria/#aria-actions)
   */
  "aria-actions"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `idref`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-activedescendant)
   */
  "aria-activedescendant"?: ReactiveARIAValue<ARIAIdRef>;
  /**
   * Spec type: `boolean` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-atomic)
   */
  "aria-atomic"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-autocomplete)
   */
  "aria-autocomplete"?: ReactiveARIAValue<"inline" | "list" | "both" | "none">;
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-braillelabel)
   */
  "aria-braillelabel"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-brailleroledescription)
   */
  "aria-brailleroledescription"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `boolean` · global · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy)
   */
  "aria-busy"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `nmtoken` · default: `"undefined"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-checked)
   */
  "aria-checked"?: ReactiveARIAValue<boolean | "false" | "mixed" | "true" | "undefined">;
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colcount)
   */
  "aria-colcount"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colindex)
   */
  "aria-colindex"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `string` · ARIAMixin extension.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colindextext)
   */
  "aria-colindextext"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colspan)
   */
  "aria-colspan"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-controls)
   */
  "aria-controls"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `nmtoken` · global · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
   */
  "aria-current"?: ReactiveARIAValue<boolean | "page" | "step" | "location" | "date" | "time" | "true" | "false">;
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby)
   */
  "aria-describedby"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-description)
   */
  "aria-description"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-details)
   */
  "aria-details"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `boolean` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled)
   */
  "aria-disabled"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `nmtokens` · global.
   * @deprecated Deprecated in WAI-ARIA 1.1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-dropeffect)
   */
  "aria-dropeffect"?: ReactiveARIAValue<ARIADropEffectValue>;
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage)
   */
  "aria-errormessage"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded)
   */
  "aria-expanded"?: ReactiveARIAValue<boolean | "true" | "false" | "undefined">;
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-flowto)
   */
  "aria-flowto"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `nmtoken` · global.
   * @deprecated Deprecated in WAI-ARIA 1.1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-grabbed)
   */
  "aria-grabbed"?: ReactiveARIAValue<boolean | "true" | "false" | "undefined">;
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-haspopup)
   */
  "aria-haspopup"?: ReactiveARIAValue<boolean | "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog">;
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden)
   */
  "aria-hidden"?: ReactiveARIAValue<boolean | "true" | "false" | "undefined">;
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
   */
  "aria-invalid"?: ReactiveARIAValue<boolean | "grammar" | "false" | "spelling" | "true">;
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts)
   */
  "aria-keyshortcuts"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label)
   */
  "aria-label"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)
   */
  "aria-labelledby"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-level)
   */
  "aria-level"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live)
   */
  "aria-live"?: ReactiveARIAValue<"assertive" | "off" | "polite">;
  /**
   * Spec type: `boolean`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal)
   */
  "aria-modal"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-multiline)
   */
  "aria-multiline"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `boolean`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-multiselectable)
   */
  "aria-multiselectable"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-orientation)
   */
  "aria-orientation"?: ReactiveARIAValue<"horizontal" | "undefined" | "vertical">;
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-owns)
   */
  "aria-owns"?: ReactiveARIAValue<ARIAIdRefs>;
  /**
   * Spec type: `string`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-placeholder)
   */
  "aria-placeholder"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-posinset)
   */
  "aria-posinset"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `nmtoken` · default: `"undefined"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed)
   */
  "aria-pressed"?: ReactiveARIAValue<boolean | "false" | "mixed" | "true" | "undefined">;
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-readonly)
   */
  "aria-readonly"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `nmtokens` · global · default: `"additions text"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-relevant)
   */
  "aria-relevant"?: ReactiveARIAValue<ARIARelevantValue>;
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-required)
   */
  "aria-required"?: ReactiveARIAValue<ARIABoolean>;
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-roledescription)
   */
  "aria-roledescription"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowcount)
   */
  "aria-rowcount"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowindex)
   */
  "aria-rowindex"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `string` · ARIAMixin extension.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowindextext)
   */
  "aria-rowindextext"?: ReactiveARIAValue<string>;
  /**
   * Spec type: `int` · min: 0.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowspan)
   */
  "aria-rowspan"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-selected)
   */
  "aria-selected"?: ReactiveARIAValue<boolean | "false" | "true" | "undefined">;
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-setsize)
   */
  "aria-setsize"?: ReactiveARIAValue<ARIAInt>;
  /**
   * Spec type: `nmtoken` · default: `"none"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-sort)
   */
  "aria-sort"?: ReactiveARIAValue<"ascending" | "descending" | "none" | "other">;
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuemax)
   */
  "aria-valuemax"?: ReactiveARIAValue<ARIADecimal>;
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuemin)
   */
  "aria-valuemin"?: ReactiveARIAValue<ARIADecimal>;
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuenow)
   */
  "aria-valuenow"?: ReactiveARIAValue<ARIADecimal>;
  /**
   * Spec type: `string`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext)
   */
  "aria-valuetext"?: ReactiveARIAValue<string>;
};

/** Canonical camelCase ARIA properties (52), using string IDs for `idref`/`idrefs` (no `*Element`/`*Elements` properties). */
export type ARIACamelCaseAttributes = {
  /**
   * Spec type: `idrefs` · global.
   * [WAI-ARIA Reference](https://w3c.github.io/aria/#aria-actions)
   */
  ariaActions?: ARIAKebabAttributes["aria-actions"];
  /**
   * Spec type: `idref`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-activedescendant)
   */
  ariaActiveDescendant?: ARIAKebabAttributes["aria-activedescendant"];
  /**
   * Spec type: `boolean` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-atomic)
   */
  ariaAtomic?: ARIAKebabAttributes["aria-atomic"];
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-autocomplete)
   */
  ariaAutoComplete?: ARIAKebabAttributes["aria-autocomplete"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-braillelabel)
   */
  ariaBrailleLabel?: ARIAKebabAttributes["aria-braillelabel"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-brailleroledescription)
   */
  ariaBrailleRoleDescription?: ARIAKebabAttributes["aria-brailleroledescription"];
  /**
   * Spec type: `boolean` · global · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy)
   */
  ariaBusy?: ARIAKebabAttributes["aria-busy"];
  /**
   * Spec type: `nmtoken` · default: `"undefined"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-checked)
   */
  ariaChecked?: ARIAKebabAttributes["aria-checked"];
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colcount)
   */
  ariaColCount?: ARIAKebabAttributes["aria-colcount"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colindex)
   */
  ariaColIndex?: ARIAKebabAttributes["aria-colindex"];
  /**
   * Spec type: `string` · ARIAMixin extension.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colindextext)
   */
  ariaColIndexText?: ARIAKebabAttributes["aria-colindextext"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colspan)
   */
  ariaColSpan?: ARIAKebabAttributes["aria-colspan"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-controls)
   */
  ariaControls?: ARIAKebabAttributes["aria-controls"];
  /**
   * Spec type: `nmtoken` · global · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
   */
  ariaCurrent?: ARIAKebabAttributes["aria-current"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby)
   */
  ariaDescribedBy?: ARIAKebabAttributes["aria-describedby"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-description)
   */
  ariaDescription?: ARIAKebabAttributes["aria-description"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-details)
   */
  ariaDetails?: ARIAKebabAttributes["aria-details"];
  /**
   * Spec type: `boolean` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled)
   */
  ariaDisabled?: ARIAKebabAttributes["aria-disabled"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage)
   */
  ariaErrorMessage?: ARIAKebabAttributes["aria-errormessage"];
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded)
   */
  ariaExpanded?: ARIAKebabAttributes["aria-expanded"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-flowto)
   */
  ariaFlowTo?: ARIAKebabAttributes["aria-flowto"];
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-haspopup)
   */
  ariaHasPopup?: ARIAKebabAttributes["aria-haspopup"];
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden)
   */
  ariaHidden?: ARIAKebabAttributes["aria-hidden"];
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
   */
  ariaInvalid?: ARIAKebabAttributes["aria-invalid"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts)
   */
  ariaKeyShortcuts?: ARIAKebabAttributes["aria-keyshortcuts"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label)
   */
  ariaLabel?: ARIAKebabAttributes["aria-label"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)
   */
  ariaLabelledBy?: ARIAKebabAttributes["aria-labelledby"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-level)
   */
  ariaLevel?: ARIAKebabAttributes["aria-level"];
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live)
   */
  ariaLive?: ARIAKebabAttributes["aria-live"];
  /**
   * Spec type: `boolean`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal)
   */
  ariaModal?: ARIAKebabAttributes["aria-modal"];
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-multiline)
   */
  ariaMultiLine?: ARIAKebabAttributes["aria-multiline"];
  /**
   * Spec type: `boolean`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-multiselectable)
   */
  ariaMultiSelectable?: ARIAKebabAttributes["aria-multiselectable"];
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-orientation)
   */
  ariaOrientation?: ARIAKebabAttributes["aria-orientation"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-owns)
   */
  ariaOwns?: ARIAKebabAttributes["aria-owns"];
  /**
   * Spec type: `string`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-placeholder)
   */
  ariaPlaceholder?: ARIAKebabAttributes["aria-placeholder"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-posinset)
   */
  ariaPosInSet?: ARIAKebabAttributes["aria-posinset"];
  /**
   * Spec type: `nmtoken` · default: `"undefined"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed)
   */
  ariaPressed?: ARIAKebabAttributes["aria-pressed"];
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-readonly)
   */
  ariaReadOnly?: ARIAKebabAttributes["aria-readonly"];
  /**
   * Spec type: `nmtokens` · global · default: `"additions text"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-relevant)
   */
  ariaRelevant?: ARIAKebabAttributes["aria-relevant"];
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-required)
   */
  ariaRequired?: ARIAKebabAttributes["aria-required"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-roledescription)
   */
  ariaRoleDescription?: ARIAKebabAttributes["aria-roledescription"];
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowcount)
   */
  ariaRowCount?: ARIAKebabAttributes["aria-rowcount"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowindex)
   */
  ariaRowIndex?: ARIAKebabAttributes["aria-rowindex"];
  /**
   * Spec type: `string` · ARIAMixin extension.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowindextext)
   */
  ariaRowIndexText?: ARIAKebabAttributes["aria-rowindextext"];
  /**
   * Spec type: `int` · min: 0.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowspan)
   */
  ariaRowSpan?: ARIAKebabAttributes["aria-rowspan"];
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-selected)
   */
  ariaSelected?: ARIAKebabAttributes["aria-selected"];
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-setsize)
   */
  ariaSetSize?: ARIAKebabAttributes["aria-setsize"];
  /**
   * Spec type: `nmtoken` · default: `"none"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-sort)
   */
  ariaSort?: ARIAKebabAttributes["aria-sort"];
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuemax)
   */
  ariaValueMax?: ARIAKebabAttributes["aria-valuemax"];
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuemin)
   */
  ariaValueMin?: ARIAKebabAttributes["aria-valuemin"];
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuenow)
   */
  ariaValueNow?: ARIAKebabAttributes["aria-valuenow"];
  /**
   * Spec type: `string`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext)
   */
  ariaValueText?: ARIAKebabAttributes["aria-valuetext"];
};

/** Lowercase-suffix camelCase aliases (28) where `aria${Capitalize<Name>}` differs from canonical camelCase (e.g. `ariaLabelledby`). */
export type ARIASimpleCamelCaseAttributes = {
  /**
   * Spec type: `idref`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-activedescendant)
   */
  ariaActivedescendant?: ARIAKebabAttributes["aria-activedescendant"];
  /**
   * Spec type: `nmtoken`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-autocomplete)
   */
  ariaAutocomplete?: ARIAKebabAttributes["aria-autocomplete"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-braillelabel)
   */
  ariaBraillelabel?: ARIAKebabAttributes["aria-braillelabel"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-brailleroledescription)
   */
  ariaBrailleroledescription?: ARIAKebabAttributes["aria-brailleroledescription"];
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colcount)
   */
  ariaColcount?: ARIAKebabAttributes["aria-colcount"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colindex)
   */
  ariaColindex?: ARIAKebabAttributes["aria-colindex"];
  /**
   * Spec type: `string` · ARIAMixin extension.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colindextext)
   */
  ariaColindextext?: ARIAKebabAttributes["aria-colindextext"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-colspan)
   */
  ariaColspan?: ARIAKebabAttributes["aria-colspan"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby)
   */
  ariaDescribedby?: ARIAKebabAttributes["aria-describedby"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage)
   */
  ariaErrormessage?: ARIAKebabAttributes["aria-errormessage"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-flowto)
   */
  ariaFlowto?: ARIAKebabAttributes["aria-flowto"];
  /**
   * Spec type: `nmtoken` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-haspopup)
   */
  ariaHaspopup?: ARIAKebabAttributes["aria-haspopup"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts)
   */
  ariaKeyshortcuts?: ARIAKebabAttributes["aria-keyshortcuts"];
  /**
   * Spec type: `idrefs` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)
   */
  ariaLabelledby?: ARIAKebabAttributes["aria-labelledby"];
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-multiline)
   */
  ariaMultiline?: ARIAKebabAttributes["aria-multiline"];
  /**
   * Spec type: `boolean`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-multiselectable)
   */
  ariaMultiselectable?: ARIAKebabAttributes["aria-multiselectable"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-posinset)
   */
  ariaPosinset?: ARIAKebabAttributes["aria-posinset"];
  /**
   * Spec type: `boolean` · default: `"false"`.
   * @remarks Screen-reader case-sensitive; pass lowercase string values.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-readonly)
   */
  ariaReadonly?: ARIAKebabAttributes["aria-readonly"];
  /**
   * Spec type: `string` · global.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-roledescription)
   */
  ariaRoledescription?: ARIAKebabAttributes["aria-roledescription"];
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowcount)
   */
  ariaRowcount?: ARIAKebabAttributes["aria-rowcount"];
  /**
   * Spec type: `int` · min: 1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowindex)
   */
  ariaRowindex?: ARIAKebabAttributes["aria-rowindex"];
  /**
   * Spec type: `string` · ARIAMixin extension.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowindextext)
   */
  ariaRowindextext?: ARIAKebabAttributes["aria-rowindextext"];
  /**
   * Spec type: `int` · min: 0.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-rowspan)
   */
  ariaRowspan?: ARIAKebabAttributes["aria-rowspan"];
  /**
   * Spec type: `int` · min: -1.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-setsize)
   */
  ariaSetsize?: ARIAKebabAttributes["aria-setsize"];
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuemax)
   */
  ariaValuemax?: ARIAKebabAttributes["aria-valuemax"];
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuemin)
   */
  ariaValuemin?: ARIAKebabAttributes["aria-valuemin"];
  /**
   * Spec type: `decimal`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuenow)
   */
  ariaValuenow?: ARIAKebabAttributes["aria-valuenow"];
  /**
   * Spec type: `string`.
   * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-valuetext)
   */
  ariaValuetext?: ARIAKebabAttributes["aria-valuetext"];
};

/**
 * Strict WAI-ARIA attributes surface supporting kebab-case (`aria-*`) and camelCase aliases (without `*Element(s)`).
 */
export type ARIAProps = ARIAKebabAttributes &
  ARIACamelCaseAttributes &
  ARIASimpleCamelCaseAttributes & {
    /**
     * WAI-ARIA role defining the semantic meaning of the element.
     * [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Roles)
     */
    role?: ReactiveARIAValue<ARIARole>;
  };

export type ARIAAttributes = ARIAProps;

/** Global WAI-ARIA attributes (25) allowed on all non-prohibited elements/roles. */
export type ARIAGlobalAttr =
  | "aria-actions"
  | "aria-atomic"
  | "aria-braillelabel"
  | "aria-brailleroledescription"
  | "aria-busy"
  | "aria-controls"
  | "aria-current"
  | "aria-describedby"
  | "aria-description"
  | "aria-details"
  | "aria-disabled"
  | "aria-dropeffect"
  | "aria-errormessage"
  | "aria-flowto"
  | "aria-grabbed"
  | "aria-haspopup"
  | "aria-hidden"
  | "aria-invalid"
  | "aria-keyshortcuts"
  | "aria-label"
  | "aria-labelledby"
  | "aria-live"
  | "aria-owns"
  | "aria-relevant"
  | "aria-roledescription";

/** Zero-runtime-cost mapping of concrete WAI-ARIA roles to their required, allowed, and prohibited ARIA attributes. */
export interface ARIARoleAttrMap {
  alert: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  alertdialog: {
    required: never;
    allowed: "aria-expanded" | "aria-modal";
    prohibited: never;
  };
  application: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded";
    prohibited: never;
  };
  article: {
    required: never;
    allowed: "aria-expanded" | "aria-posinset" | "aria-setsize";
    prohibited: never;
  };
  banner: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  blockquote: {
    required: never;
    allowed: never;
    prohibited: never;
  };
  button: {
    required: never;
    allowed: "aria-expanded" | "aria-pressed";
    prohibited: never;
  };
  caption: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  cell: {
    required: never;
    allowed: "aria-colindex" | "aria-colspan" | "aria-expanded" | "aria-rowindex" | "aria-rowspan";
    prohibited: never;
  };
  checkbox: {
    required: "aria-checked";
    allowed: "aria-expanded" | "aria-readonly" | "aria-required";
    prohibited: never;
  };
  code: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  columnheader: {
    required: never;
    allowed:
      | "aria-colindex"
      | "aria-colspan"
      | "aria-expanded"
      | "aria-readonly"
      | "aria-required"
      | "aria-rowindex"
      | "aria-rowspan"
      | "aria-selected"
      | "aria-sort";
    prohibited: never;
  };
  combobox: {
    required: "aria-controls" | "aria-expanded";
    allowed:
      | "aria-activedescendant"
      | "aria-autocomplete"
      | "aria-orientation"
      | "aria-owns"
      | "aria-readonly"
      | "aria-required";
    prohibited: never;
  };
  comment: {
    required: never;
    allowed: "aria-level" | "aria-posinset" | "aria-setsize";
    prohibited: never;
  };
  complementary: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  contentinfo: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  definition: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  deletion: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  dialog: {
    required: never;
    allowed: "aria-expanded" | "aria-modal";
    prohibited: never;
  };
  directory: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  document: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  emphasis: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  feed: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  figure: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  form: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  grid: {
    required: never;
    allowed:
      | "aria-activedescendant"
      | "aria-colcount"
      | "aria-expanded"
      | "aria-level"
      | "aria-multiselectable"
      | "aria-readonly"
      | "aria-rowcount";
    prohibited: never;
  };
  gridcell: {
    required: never;
    allowed:
      | "aria-colindex"
      | "aria-colspan"
      | "aria-expanded"
      | "aria-readonly"
      | "aria-required"
      | "aria-rowindex"
      | "aria-rowspan"
      | "aria-selected";
    prohibited: never;
  };
  group: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded";
    prohibited: never;
  };
  heading: {
    required: "aria-level";
    allowed: "aria-expanded";
    prohibited: never;
  };
  image: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  img: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  insertion: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  link: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  list: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  listbox: {
    required: never;
    allowed:
      | "aria-activedescendant"
      | "aria-expanded"
      | "aria-multiselectable"
      | "aria-orientation"
      | "aria-readonly"
      | "aria-required";
    prohibited: never;
  };
  listitem: {
    required: never;
    allowed: "aria-expanded" | "aria-level" | "aria-posinset" | "aria-setsize";
    prohibited: never;
  };
  log: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  main: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  mark: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  marquee: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  math: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  menu: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded" | "aria-orientation";
    prohibited: never;
  };
  menubar: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded" | "aria-orientation";
    prohibited: never;
  };
  menuitem: {
    required: never;
    allowed: "aria-expanded" | "aria-posinset" | "aria-setsize";
    prohibited: never;
  };
  menuitemcheckbox: {
    required: "aria-checked";
    allowed: "aria-expanded" | "aria-posinset" | "aria-readonly" | "aria-setsize";
    prohibited: never;
  };
  menuitemradio: {
    required: "aria-checked";
    allowed: "aria-expanded" | "aria-posinset" | "aria-readonly" | "aria-setsize";
    prohibited: never;
  };
  meter: {
    required: "aria-valuenow";
    allowed: "aria-valuemax" | "aria-valuemin" | "aria-valuetext";
    prohibited: never;
  };
  navigation: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  none: {
    required: never;
    allowed: never;
    prohibited: "aria-label" | "aria-labelledby";
  };
  note: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  option: {
    required: never;
    allowed: "aria-checked" | "aria-posinset" | "aria-selected" | "aria-setsize";
    prohibited: never;
  };
  paragraph: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  presentation: {
    required: never;
    allowed: never;
    prohibited: "aria-label" | "aria-labelledby";
  };
  progressbar: {
    required: never;
    allowed: "aria-expanded" | "aria-valuemax" | "aria-valuemin" | "aria-valuenow" | "aria-valuetext";
    prohibited: never;
  };
  radio: {
    required: "aria-checked";
    allowed: "aria-posinset" | "aria-required" | "aria-setsize";
    prohibited: never;
  };
  radiogroup: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded" | "aria-orientation" | "aria-readonly" | "aria-required";
    prohibited: never;
  };
  region: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  row: {
    required: never;
    allowed:
      | "aria-activedescendant"
      | "aria-colindex"
      | "aria-expanded"
      | "aria-level"
      | "aria-posinset"
      | "aria-rowindex"
      | "aria-selected"
      | "aria-setsize";
    prohibited: never;
  };
  rowgroup: {
    required: never;
    allowed: never;
    prohibited: never;
  };
  rowheader: {
    required: never;
    allowed:
      | "aria-colindex"
      | "aria-colspan"
      | "aria-expanded"
      | "aria-readonly"
      | "aria-required"
      | "aria-rowindex"
      | "aria-rowspan"
      | "aria-selected"
      | "aria-sort";
    prohibited: never;
  };
  scrollbar: {
    required: "aria-valuenow";
    allowed: "aria-controls" | "aria-orientation" | "aria-valuemax" | "aria-valuemin" | "aria-valuetext";
    prohibited: never;
  };
  search: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  searchbox: {
    required: never;
    allowed:
      | "aria-activedescendant"
      | "aria-autocomplete"
      | "aria-multiline"
      | "aria-placeholder"
      | "aria-readonly"
      | "aria-required";
    prohibited: never;
  };
  sectionfooter: {
    required: never;
    allowed: never;
    prohibited: never;
  };
  sectionheader: {
    required: never;
    allowed: never;
    prohibited: never;
  };
  separator: {
    required: "aria-valuenow";
    allowed: "aria-orientation" | "aria-valuemax" | "aria-valuemin" | "aria-valuetext";
    prohibited: never;
  };
  slider: {
    required: "aria-valuenow";
    allowed:
      | "aria-orientation"
      | "aria-readonly"
      | "aria-required"
      | "aria-valuemax"
      | "aria-valuemin"
      | "aria-valuetext";
    prohibited: never;
  };
  spinbutton: {
    required: never;
    allowed:
      | "aria-activedescendant"
      | "aria-readonly"
      | "aria-required"
      | "aria-valuemax"
      | "aria-valuemin"
      | "aria-valuenow"
      | "aria-valuetext";
    prohibited: never;
  };
  status: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  strong: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  subscript: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  suggestion: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  superscript: {
    required: never;
    allowed: never;
    prohibited: "aria-actions" | "aria-label" | "aria-labelledby";
  };
  switch: {
    required: "aria-checked";
    allowed: "aria-expanded" | "aria-readonly" | "aria-required";
    prohibited: never;
  };
  tab: {
    required: never;
    allowed: "aria-expanded" | "aria-posinset" | "aria-selected" | "aria-setsize";
    prohibited: never;
  };
  table: {
    required: never;
    allowed: "aria-colcount" | "aria-expanded" | "aria-rowcount";
    prohibited: never;
  };
  tablist: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded" | "aria-level" | "aria-multiselectable" | "aria-orientation";
    prohibited: never;
  };
  tabpanel: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  term: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  text: {
    required: never;
    allowed: never;
    prohibited: never;
  };
  textbox: {
    required: never;
    allowed:
      | "aria-activedescendant"
      | "aria-autocomplete"
      | "aria-multiline"
      | "aria-placeholder"
      | "aria-readonly"
      | "aria-required";
    prohibited: never;
  };
  time: {
    required: never;
    allowed: never;
    prohibited: never;
  };
  timer: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  toolbar: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded" | "aria-orientation";
    prohibited: never;
  };
  tooltip: {
    required: never;
    allowed: "aria-expanded";
    prohibited: never;
  };
  tree: {
    required: never;
    allowed: "aria-activedescendant" | "aria-expanded" | "aria-multiselectable" | "aria-orientation" | "aria-required";
    prohibited: never;
  };
  treegrid: {
    required: never;
    allowed:
      | "aria-activedescendant"
      | "aria-colcount"
      | "aria-expanded"
      | "aria-level"
      | "aria-multiselectable"
      | "aria-orientation"
      | "aria-readonly"
      | "aria-required"
      | "aria-rowcount";
    prohibited: never;
  };
  treeitem: {
    required: never;
    allowed: "aria-checked" | "aria-expanded" | "aria-level" | "aria-posinset" | "aria-selected" | "aria-setsize";
    prohibited: never;
  };
}

/**
 * HTML elements where W3C ARIA in HTML prohibits assigning any `role` or `aria-*` attributes.
 * [W3C ARIA in HTML](https://www.w3.org/TR/html-aria/#docconformance)
 */
export type ARIAProhibitedTag =
  | "base"
  | "col"
  | "colgroup"
  | "head"
  | "link"
  | "meta"
  | "noscript"
  | "script"
  | "source"
  | "style"
  | "template"
  | "title"
  | "track";

/**
 * HTML elements whose implicit role prohibits `aria-label`, `aria-labelledby`, and `aria-actions` unless given an explicit `role`.
 * [W3C ARIA in HTML](https://www.w3.org/TR/html-aria/#docconformance)
 */
export type ARIANamingProhibitedTag =
  | "caption"
  | "code"
  | "del"
  | "em"
  | "ins"
  | "mark"
  | "p"
  | "strong"
  | "sub"
  | "sup";

/** Generic HTML container and phrasing elements without an implicit accessible name role. */
export type ARIAGenericTag =
  | "div"
  | "span"
  | "b"
  | "i"
  | "u"
  | "small"
  | "pre"
  | "q"
  | "s"
  | "samp"
  | "data"
  | "bdi"
  | "bdo";

/**
 * Element-scoped ARIA props: prohibits all ARIA attributes and `role` on non-renderable metadata/structural tags.
 */
export type ElementARIAProps<K extends string> = [K] extends [ARIAProhibitedTag]
  ? { [P in keyof ARIAProps]?: never }
  : ARIAProps;

/** Normalizes any kebab-case or camelCase ARIA prop key to its canonical kebab-case attribute name. */
export type ARIACanonicalKey<K extends string> = K extends keyof ARIAKebabAttributes
  ? K
  : K extends `aria${infer Rest}`
    ? `aria-${Lowercase<Rest>}` & keyof ARIAKebabAttributes
    : never;

type ExplicitKeys<P> = {
  [K in keyof P]-?: Record<never, never> extends Pick<P, K> ? never : [P[K]] extends [undefined] ? never : K;
}[keyof P];

type ExplicitARIAKeys<P> = {
  [K in ExplicitKeys<P> & string]: ARIACanonicalKey<K> extends never ? never : K;
}[ExplicitKeys<P> & string];

/** Extracts ARIA keys in `P` that refer to the same underlying `aria-*` attribute (e.g. `aria-label` + `ariaLabel`). */
export type DuplicateARIAKeys<P> = {
  [K in ExplicitARIAKeys<P>]: ARIACanonicalKey<K> extends ARIACanonicalKey<Exclude<ExplicitARIAKeys<P>, K>> ? K : never;
}[ExplicitARIAKeys<P>];

type IsUnion<T, Copy = T> = T extends unknown ? ([Copy] extends [T] ? false : true) : never;

type ExplicitLiteralRole<P> =
  "role" extends ExplicitKeys<P>
    ? P["role"] extends ARIARole
      ? IsUnion<P["role"]> extends false
        ? P["role"]
        : never
      : never
    : never;

type RoleProhibitedKeys<P, R extends ARIARole = ExplicitLiteralRole<P>> = [R] extends [never]
  ? never
  : {
      [K in ExplicitARIAKeys<P>]: ARIACanonicalKey<K> extends ARIARoleAttrMap[R]["prohibited"] ? K : never;
    }[ExplicitARIAKeys<P>];

type NamingProhibitedKeys<KTag extends string, P> = [KTag] extends [ARIANamingProhibitedTag]
  ? IsUnion<KTag> extends false
    ? "role" extends ExplicitKeys<P>
      ? never
      : {
          [K in ExplicitARIAKeys<P>]: ARIACanonicalKey<K> extends "aria-label" | "aria-labelledby" | "aria-actions"
            ? K
            : never;
        }[ExplicitARIAKeys<P>]
    : never
  : never;

type ProhibitedTagARIAKeys<KTag extends string, P> = [KTag] extends [ARIAProhibitedTag]
  ? IsUnion<KTag> extends false
    ? Extract<ExplicitKeys<P>, keyof ARIAProps>
    : never
  : never;

type InvalidARIAKeys<KTag extends string, P> =
  | DuplicateARIAKeys<P>
  | ProhibitedTagARIAKeys<KTag, P>
  | RoleProhibitedKeys<P>
  | NamingProhibitedKeys<KTag, P>;

type ExactExcessKeys<P, Allowed> = Exclude<keyof P, keyof Allowed>;

/**
 * Enforces compile-time checks on element props for duplicate kebab/camelCase ARIA keys,
 * ARIA-prohibited HTML elements (e.g. `<meta>`, `<script>`), role-prohibited attributes
 * (e.g. `aria-label` on `role="presentation"`), naming-prohibited HTML elements without an explicit `role`,
 * and excess/unknown keys when `Allowed` is provided.
 */
export type ValidateARIAProps<KTag extends string, P, Allowed = unknown> = string extends keyof P
  ? unknown
  : Record<never, never> extends P
    ? unknown
    : [InvalidARIAKeys<KTag, P> | (unknown extends Allowed ? never : ExactExcessKeys<P, Allowed>)] extends [never]
      ? unknown
      : { [K in InvalidARIAKeys<KTag, P> | (unknown extends Allowed ? never : ExactExcessKeys<P, Allowed>)]: never };
