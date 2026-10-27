import { describe, expect, it } from "vitest";
import { createComponent } from "../component/create-component.js";
import { createValue } from "../observable/value.js";
import { resolvePropsAndChildren } from "./resolve-props-and-children.js";

describe("resolvePropsAndChildren", () => {
  it("resolves string child with no props", () => {
    const [props, children] = resolvePropsAndChildren("Hello World");
    expect(props).toEqual({});
    expect(children).toBe("Hello World");
  });

  it("resolves array of children with no props", () => {
    const childList = ["a", "b"];
    const [props, children] = resolvePropsAndChildren(childList);
    expect(props).toEqual({});
    expect(children).toBe(childList);
  });

  it("resolves DOM Element child with no props", () => {
    const el = document.createElement("span");
    const [props, children] = resolvePropsAndChildren(el);
    expect(props).toEqual({});
    expect(children).toBe(el);
  });

  it("resolves Value child with no props", () => {
    const val = createValue("reactive");
    const [props, children] = resolvePropsAndChildren(val);
    expect(props).toEqual({});
    expect(children).toBe(val);
  });

  it("resolves Component child with no props", () => {
    const comp = createComponent(() => "Comp")();
    const [props, children] = resolvePropsAndChildren(comp);
    expect(props).toEqual({});
    expect(children).toBe(comp);
  });

  it("resolves props and children when both are passed", () => {
    interface MyProps {
      id: string;
      disabled?: boolean;
    }
    const [props, children] = resolvePropsAndChildren<MyProps>({ id: "btn", disabled: true }, "Click me");
    expect(props).toEqual({ id: "btn", disabled: true });
    expect(children).toBe("Click me");
  });

  it("resolves props-only when no children are passed", () => {
    interface MyProps {
      id: string;
    }
    const [props, children] = resolvePropsAndChildren<MyProps>({ id: "custom" });
    expect(props).toEqual({ id: "custom" });
    expect(children).toBeUndefined();
  });

  it("resolves empty props and undefined children when called with no arguments", () => {
    const [props, children] = resolvePropsAndChildren();
    expect(props).toEqual({});
    expect(children).toBeUndefined();
  });

  it("resolves empty props and undefined children when called with null or undefined", () => {
    const [props1, children1] = resolvePropsAndChildren(null);
    expect(props1).toEqual({});
    expect(children1).toBeUndefined();

    const [props2, children2] = resolvePropsAndChildren(undefined);
    expect(props2).toEqual({});
    expect(children2).toBeUndefined();
  });

  it("resolves null props with children correctly", () => {
    const [props, children] = resolvePropsAndChildren(null, "Child content");
    expect(props).toEqual({});
    expect(children).toBe("Child content");
  });

  it("merges defaultProps underneath user props", () => {
    interface MyProps {
      as?: string;
      disabled?: boolean;
      className?: string;
    }

    // Default props only
    const [props1, children1] = resolvePropsAndChildren<MyProps>(undefined, "Text", { as: "div", disabled: false });
    expect(props1).toEqual({ as: "div", disabled: false });
    expect(children1).toBe("Text");

    // Overridden by user props
    const [props2, children2] = resolvePropsAndChildren<MyProps>({ as: "button", className: "primary" }, "Text", {
      as: "div",
      disabled: false,
    });
    expect(props2).toEqual({ as: "button", disabled: false, className: "primary" });
    expect(children2).toBe("Text");

    // Children passed as first argument with defaultProps
    const [props3, children3] = resolvePropsAndChildren<MyProps>("Text", undefined, { as: "div" });
    expect(props3).toEqual({ as: "div" });
    expect(children3).toBe("Text");
  });
});
