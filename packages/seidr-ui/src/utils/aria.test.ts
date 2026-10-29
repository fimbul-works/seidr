import { createValue } from "@fimbul-works/seidr";
import { describe, expect, it } from "vitest";
import { combineAriaDescribedBy, combineAriaLabelledBy, extractAriaProps } from "./aria.js";

describe("extractAriaProps", () => {
  it("returns a tuple with extracted aria props and clean rest props", () => {
    const props = {
      id: "input-1",
      className: "field",
      "aria-label": "User Name",
      "aria-describedby": "help-1",
      dataCustom: "value",
    };

    const [aria, rest] = extractAriaProps(props);

    expect(aria.ariaLabel).toBe("User Name");
    expect(aria.ariaDescribedBy).toBe("help-1");
    expect(aria.ariaLabelledBy).toBeUndefined();
    expect(aria.ariaErrorMessage).toBeUndefined();

    // Rest props must NOT contain any aria keys
    expect(rest).toEqual({
      id: "input-1",
      className: "field",
      dataCustom: "value",
    });
    expect((rest as Record<string, unknown>)["aria-label"]).toBeUndefined();
    expect((rest as Record<string, unknown>)["aria-describedby"]).toBeUndefined();
  });

  it("handles camelCase and lowercase casing variations", () => {
    const props = {
      ariaLabel: "Camel Label",
      ariaLabelledBy: "id-by-camel",
      ariaDescribedby: "id-desc-lower",
      ariaErrorMessage: "err-camel",
      otherProp: 42,
    };

    const [aria, rest] = extractAriaProps(props);

    expect(aria.ariaLabel).toBe("Camel Label");
    expect(aria.ariaLabelledBy).toBe("id-by-camel");
    expect(aria.ariaDescribedBy).toBe("id-desc-lower");
    expect(aria.ariaErrorMessage).toBe("err-camel");

    expect(rest).toEqual({ otherProp: 42 });
  });

  it("prioritizes kebab-case over camelCase and lowercase", () => {
    const props = {
      "aria-labelledby": "kebab-id",
      ariaLabelledBy: "camel-id",
      ariaLabelledby: "lower-id",
    };

    const [aria, rest] = extractAriaProps(props);
    expect(aria.ariaLabelledBy).toBe("kebab-id");
    expect(Object.keys(rest)).toHaveLength(0);
  });
});

describe("combineAriaLabelledBy", () => {
  it("returns internalLabelId when no custom labelledBy or label is provided", () => {
    const combined = combineAriaLabelledBy({
      internalLabelId: "form-label-id",
    });

    expect(combined()).toBe("form-label-id");
  });

  it("combines user ariaLabelledBy and internalLabelId", () => {
    const combined = combineAriaLabelledBy({
      ariaLabelledBy: "custom-id",
      internalLabelId: "form-label-id",
    });

    expect(combined()).toBe("custom-id form-label-id");
  });

  it("includes fieldId when both custom ariaLabelledBy and explicit ariaLabel are provided", () => {
    const combined = combineAriaLabelledBy({
      ariaLabelledBy: "custom-id",
      ariaLabel: "Self Label",
      internalLabelId: "form-label-id",
      fieldId: "my-input",
    });

    expect(combined()).toBe("custom-id form-label-id my-input");
  });

  it("reactively updates when observable inputs mutate", () => {
    const customLabelledBy = createValue<string | undefined>("initial-custom");
    const internalLabel = createValue<string | undefined>("label-1");

    const combined = combineAriaLabelledBy({
      ariaLabelledBy: customLabelledBy,
      internalLabelId: internalLabel,
    });

    expect(combined()).toBe("initial-custom label-1");

    customLabelledBy(undefined);
    expect(combined()).toBe("label-1");

    internalLabel(undefined);
    expect(combined()).toBeUndefined();
  });
});

describe("combineAriaDescribedBy", () => {
  it("combines internalDescribedBy with user-provided ariaDescribedBy", () => {
    const combined = combineAriaDescribedBy({
      internalDescribedBy: "desc-1 err-1",
      ariaDescribedBy: "user-desc",
    });

    expect(combined()).toBe("desc-1 err-1 user-desc");
  });

  it("handles undefined sources cleanly", () => {
    const combined = combineAriaDescribedBy({
      internalDescribedBy: undefined,
      ariaDescribedBy: undefined,
    });

    expect(combined()).toBeUndefined();
  });

  it("reactively tracks reactive values", () => {
    const internal = createValue<string | undefined>("internal-desc");
    const user = createValue<string | undefined>(undefined);

    const combined = combineAriaDescribedBy({
      internalDescribedBy: internal,
      ariaDescribedBy: user,
    });

    expect(combined()).toBe("internal-desc");

    user("custom-desc");
    expect(combined()).toBe("internal-desc custom-desc");
  });
});
