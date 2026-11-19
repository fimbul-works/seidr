import { describe, expect, it } from "vitest";
import { $code, $div, $meta, $p, $script } from "../elements/index.js";
import { createValue } from "../observable/value.js";
import { $ } from "./create-element.js";
import type { ARIAAttributes, ARIAProps, ARIARole } from "./types.aria.js";
import type { SeidrElementProps, SeidrElementTagNameMap } from "./types.js";

function typeAssertions(): void {
  const boolVal = createValue(false);
  const numVal = createValue(50);
  const strVal = createValue<string | undefined>("hint");
  const orientationVal = createValue<"horizontal" | "vertical">("horizontal");
  const expandedDerived = boolVal.as((v) => (v ? "true" : undefined));

  // Valid kebab-case, canonical camelCase, and simple camelCase ARIA props
  $div({ "aria-label": "Close" });
  $div({ ariaLabel: "Close" });
  $div({ "aria-labelledby": "title-id" });
  $div({ ariaLabelledBy: "title-id" });
  $div({ ariaLabelledby: "title-id" });
  $div({ ariaReadOnly: true });
  $div({ ariaReadonly: "false" });
  $div({ ariaValueNow: 42 });
  $div({ ariaValuenow: numVal });
  $div({ ariaMultiLine: true });
  $div({ ariaMultiline: false });
  $div({ ariaActiveDescendant: "opt-1" });
  $div({ ariaActivedescendant: "opt-1" });

  // Covariant reactive values
  $div({
    "aria-disabled": boolVal,
    "aria-expanded": expandedDerived,
    "aria-valuenow": numVal,
    "aria-describedby": strVal,
    "aria-orientation": orientationVal,
  });

  // Explicit undefined alongside another variant is allowed (destructured override pattern)
  $div({ "aria-label": "Close", ariaLabel: undefined });

  // ARIARole literal & wide ARIARole
  $div({ role: "button", "aria-pressed": true });
  const dynamicRole: ARIARole = "dialog" as ARIARole;
  $div({ role: dynamicRole, "aria-label": "Dynamic" });

  // Naming-prohibited semantic tags WITH explicit role are valid
  $p({ role: "alert", "aria-label": "Warning message" });
  $code({ role: "textbox", ariaLabelledBy: "code-label" });

  // Type alias check
  const ariaBag: ARIAProps = { role: "region", ariaLabel: "Summary" };
  const aliasBag: ARIAAttributes = ariaBag;
  $div(aliasBag);

  // Polymorphic element pass-through
  function renderPolymorphic<T extends keyof SeidrElementTagNameMap = "div">(
    as: T,
    props: SeidrElementProps<T>,
  ): SeidrElementTagNameMap[T] {
    return $(as, { ...props, "aria-label": "Polymorphic" } as SeidrElementProps<T>);
  }
  renderPolymorphic("button", { type: "button" });

  // ---------------------------------------------------------------------------
  // Compile-time rejections (@ts-expect-error)
  // ---------------------------------------------------------------------------

  // Duplicate kebab + camelCase / canonical + simple camelCase
  // @ts-expect-error duplicate aria-label and ariaLabel
  $div({ "aria-label": "a", ariaLabel: "b" });
  // @ts-expect-error duplicate aria-labelledby and ariaLabelledBy
  $div({ "aria-labelledby": "a", ariaLabelledBy: "b" });
  // @ts-expect-error duplicate ariaLabelledBy and ariaLabelledby
  $div({ ariaLabelledBy: "a", ariaLabelledby: "b" });
  // @ts-expect-error duplicate via $()
  $("button", { "aria-disabled": true, ariaDisabled: false });

  // Omitted DOM Element reflection properties (*Element / *Elements)
  // @ts-expect-error ariaLabelledByElements is disallowed
  $div({ ariaLabelledByElements: [] });
  // @ts-expect-error ariaActiveDescendantElement is disallowed
  $div({ ariaActiveDescendantElement: null });

  // Strict value checks
  // @ts-expect-error invalid aria-orientation value
  $div({ "aria-orientation": "diagonal" });
  // @ts-expect-error invalid ariaLive value
  $div({ ariaLive: "loud" });
  // @ts-expect-error invalid role value
  $div({ role: "not-a-role" });
  // @ts-expect-error wrong reactive value type
  $div({ "aria-disabled": numVal });

  // Unknown ARIA & excess properties
  // @ts-expect-error unknown aria-* attribute
  $div({ "aria-bogus": "x" });
  // @ts-expect-error unknown excess prop
  $div({ bogusProp: 123 });
  // @ts-expect-error unknown excess prop via $()
  $("div", { bogusProp: 123 });

  // Prohibited HTML elements (metadata / structural)
  // @ts-expect-error ARIA attributes prohibited on <meta>
  $meta({ "aria-label": "x" });
  // @ts-expect-error role prohibited on <script>
  $script({ role: "button" });

  // Naming-prohibited HTML elements without explicit role
  // @ts-expect-error aria-label prohibited on <p> without role
  $p({ "aria-label": "x" });
  // @ts-expect-error ariaLabelledBy prohibited on <code> without role
  $code({ ariaLabelledBy: "x" });

  // Role-prohibited attributes
  // @ts-expect-error aria-label prohibited on role="presentation"
  $div({ role: "presentation", "aria-label": "x" });
  // @ts-expect-error ariaLabelledBy prohibited on role="none"
  $div({ role: "none", ariaLabelledBy: "x" });
}

describe("ARIA Type Definitions", () => {
  it("exposes strict compile-time ARIA validation", () => {
    expect(typeof typeAssertions).toBe("function");
  });
});
