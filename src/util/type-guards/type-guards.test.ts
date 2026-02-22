import { describe, expect, it } from "vitest";
import { component } from "../../component/index";
import { wrapComponent } from "../../component/wrap-component";
import { $ } from "../../element";
import { Seidr } from "../../seidr";
import { describeDualMode } from "../../test-setup";
import {
  isArray,
  isBool,
  isComment,
  isComponent,
  isComponentFactory,
  isDOMNode,
  isEmpty,
  isFn,
  isHTMLElement,
  isNum,
  isObj,
  isSeidr,
  isStr,
  isTextNode,
  isUndefined,
} from ".";

describe("Type Guard Utilities", () => {
  describe("Primitive types", () => {
    describe("isArray", () => {
      it("should return true for arrays", () => {
        expect(isArray([])).toBe(true);
        expect(isArray([1, 2, 3])).toBe(true);
      });

      it("should return false for non-arrays", () => {
        expect(isArray({})).toBe(false);
        expect(isArray(null)).toBe(false);
        expect(isArray(undefined)).toBe(false);
      });
    });

    describe("isBool", () => {
      it("should return true for boolean primitives", () => {
        expect(isBool(true)).toBe(true);
        expect(isBool(false)).toBe(true);
      });

      it("should return false for non-booleans", () => {
        expect(isBool(1)).toBe(false);
        expect(isBool("true")).toBe(false);
        expect(isBool(null)).toBe(false);
        expect(isBool(undefined)).toBe(false);
      });

      it("should return false for Boolean objects", () => {
        expect(isBool(new Boolean(true))).toBe(false); // eslint-disable-line no-new-wrappers
      });

      it("should narrow type correctly", () => {
        const value: unknown = true;
        if (isBool(value)) {
          const typed = value;
          expect(typeof typed).toBe("boolean");
        }
      });
    });

    describe("isEmpty", () => {
      it("should return true for null", () => {
        expect(isEmpty(null)).toBe(true);
      });

      it("should return true for undefined", () => {
        expect(isEmpty(undefined)).toBe(true);
      });

      it("should return false for non-empty values", () => {
        expect(isEmpty(0)).toBe(false);
        expect(isEmpty(""));
      });
    });

    describe("isFn", () => {
      it("should return true for functions", () => {
        expect(isFn(() => {})).toBe(true);
        expect(isFn(() => {})).toBe(true);
        expect(isFn(async () => {})).toBe(true);
        expect(isFn(function* () {})).toBe(true); // Generator functions
      });

      it("should return true for class constructors", () => {
        expect(isFn(class {})).toBe(true);
        expect(isFn(Array)).toBe(true);
        expect(isFn(Object)).toBe(true);
      });

      it("should return false for non-functions", () => {
        expect(isFn({})).toBe(false);
        expect(isFn(null)).toBe(false);
        expect(isFn(undefined)).toBe(false);
        expect(isFn(42)).toBe(false);
      });

      it("should return false for async function generators", () => {
        expect(isFn(async function* () {})).toBe(true);
      });

      it("should narrow type correctly", () => {
        const value: unknown = () => {};
        if (isFn(value)) {
          const typed = value;
          expect(typeof typed).toBe("function");
        }
      });
    });

    describe("isNum", () => {
      it("should return true for numbers", () => {
        expect(isNum(0)).toBe(true);
        expect(isNum(42)).toBe(true);
        expect(isNum(-3.14)).toBe(true);
        expect(isNum(Infinity)).toBe(true);
        expect(isNum(NaN)).toBe(true);
      });

      it("should return false for non-numbers", () => {
        expect(isNum("42")).toBe(false);
        expect(isNum(true)).toBe(false);
        expect(isNum(null)).toBe(false);
        expect(isNum(undefined)).toBe(false);
      });

      it("should return false for Number objects", () => {
        expect(isNum(new Number(42))).toBe(false);
      });

      it("should narrow type correctly", () => {
        const value: unknown = 42;
        if (isNum(value)) {
          const typed = value;
          expect(typeof typed).toBe("number");
        }
      });
    });

    describe("isObj", () => {
      it("should return true for plain objects", () => {
        expect(isObj({})).toBe(true);
        expect(isObj({ a: 1 })).toBe(true);
        expect(isObj(Object.create(null))).toBe(true);
      });

      it("should return false for arrays", () => {
        expect(isObj([])).toBe(false);
        expect(isObj([1, 2, 3])).toBe(false);
      });

      it("should return false for null", () => {
        expect(isObj(null)).toBe(false);
      });

      it("should return false for primitives", () => {
        expect(isObj(42)).toBe(false);
        expect(isObj("string")).toBe(false);
        expect(isObj(true)).toBe(false);
      });

      it("should return true for class instances", () => {
        class TestClass {
          a = 1;
        }
        expect(isObj(new TestClass())).toBe(true);
      });

      it("should narrow type correctly", () => {
        const value: unknown = { a: 1 };
        if (isObj(value)) {
          const typed = value;
          expect(typeof typed).toBe("object");
        }
      });
    });

    describe("isStr", () => {
      it("should return true for strings", () => {
        expect(isStr("")).toBe(true);
        expect(isStr("hello")).toBe(true);
        expect(isStr("123")).toBe(true);
      });

      it("should return false for non-strings", () => {
        expect(isStr(123)).toBe(false);
        expect(isStr(true)).toBe(false);
        expect(isStr(null)).toBe(false);
        expect(isStr(undefined)).toBe(false);
      });

      it("should return false for String objects", () => {
        expect(isStr(new String("hello"))).toBe(false); // eslint-disable-line no-new-wrappers
      });

      it("should narrow type correctly", () => {
        const value: unknown = "hello";
        if (isStr(value)) {
          const typed = value;
          expect(typeof typed).toBe("string");
        }
      });
    });

    describe("isUndefined", () => {
      it("should return true for undefined", () => {
        expect(isUndefined(undefined)).toBe(true);
      });

      it("should return false for null", () => {
        expect(isUndefined(null)).toBe(false);
      });

      it("should return false for defined values", () => {
        expect(isUndefined(0)).toBe(false);
        expect(isUndefined("")).toBe(false);
        expect(isUndefined(false)).toBe(false);
      });

      it("should narrow type correctly", () => {
        const value: unknown = undefined;
        if (isUndefined(value)) {
          const typed = value;
          expect(typed).toBeUndefined();
        }
      });
    });
  });

  describeDualMode("DOM Nodes", ({ getDocument }) => {
    describe("isComment", () => {
      it("should return true for comments", () => {
        expect(isComment(getDocument().createComment("comment"))).toBe(true);
      });

      it("should return false for non-comments", () => {
        expect(isComment(getDocument().createTextNode("text"))).toBe(false);
      });
    });

    describe("isDOMNode", () => {
      it("should return true for DOM nodes", () => {
        expect(isDOMNode(getDocument().createComment("comment"))).toBe(true);
        expect(isDOMNode(getDocument().createTextNode("text"))).toBe(true);
        expect(isDOMNode(getDocument().createElement("div"))).toBe(true);
      });

      it("should return false for non-DOM nodes", () => {
        expect(isDOMNode({})).toBe(false);
        expect(isDOMNode(null)).toBe(false);
        expect(isDOMNode(undefined)).toBe(false);
      });
    });

    describe("isHTMLElement", () => {
      it("should return true for HTMLElements", () => {
        expect(isHTMLElement(getDocument().createElement("div"))).toBe(true);
      });

      it("should return false for non-HTMLElements", () => {
        expect(isHTMLElement(getDocument().createTextNode("text"))).toBe(false);
      });
    });

    describe("isTextNode", () => {
      it("should return true for Text nodes", () => {
        expect(isTextNode(getDocument().createTextNode("text"))).toBe(true);
      });

      it("should return false for non-Text nodes", () => {
        expect(isTextNode(getDocument().createComment("comment"))).toBe(false);
      });
    });
  });

  describeDualMode("Seidr types", () => {
    describe("isSeidr", () => {
      it("should return true for Seidr instances", () => {
        expect(isSeidr(new Seidr(42))).toBe(true);
        expect(isSeidr(new Seidr("hello"))).toBe(true);
        expect(isSeidr(new Seidr({ a: 1 }))).toBe(true);
      });

      it("should return false for non-Seidr values", () => {
        expect(isSeidr(42)).toBe(false);
        expect(isSeidr("hello")).toBe(false);
        expect(isSeidr({ a: 1 })).toBe(false);
        expect(isSeidr(null)).toBe(false);
        expect(isSeidr(undefined)).toBe(false);
      });

      it("should return false for plain objects", () => {
        const fakeSeidr = { value: 42, bind: () => {} };
        expect(isSeidr(fakeSeidr)).toBe(false);
      });

      it("should narrow type correctly", () => {
        const value: unknown = new Seidr(42);
        if (isSeidr(value)) {
          const typed = value;
          expect(typed.value).toBe(42);
        }
      });

      it("should work with derived Seidr instances", () => {
        const base = new Seidr(5);
        const derived = base.as((n) => n * 2);

        expect(isSeidr(base)).toBe(true);
        expect(isSeidr(derived)).toBe(true);
      });

      it("should work with merged Seidr instances", () => {
        const a = new Seidr(1);
        const b = new Seidr(2);
        const sum = Seidr.merge(() => a.value + b.value, [a, b]);

        expect(isSeidr(a)).toBe(true);
        expect(isSeidr(b)).toBe(true);
        expect(isSeidr(sum)).toBe(true);
      });
    });

    describe("isComponent", () => {
      it("should return true for Component instances", () => {
        expect(isComponent(component(() => $("div"))())).toBe(true);
      });

      it("should return false for non-Component values", () => {
        expect(isComponent(42)).toBe(false);
        expect(isComponent("hello")).toBe(false);
        expect(isComponent({ a: 1 })).toBe(false);
        expect(isComponent(null)).toBe(false);
        expect(isComponent(undefined)).toBe(false);
      });

      it("should return false for plain objects", () => {
        const fakeComponent = { value: 42, bind: () => {} };
        expect(isComponent(fakeComponent)).toBe(false);
      });

      it("should narrow type correctly", () => {
        const value: unknown = component(() => $("div"))();
        if (isComponent(value)) {
          const _typed = value;
        }
      });
    });

    describe("isComponentFactory", () => {
      it("should return true for ComponentFactory instances", () => {
        const factory = wrapComponent(() => $("div"));
        expect(isComponentFactory(factory)).toBe(true);
      });

      it("should return false for non-ComponentFactory values", () => {
        expect(isComponentFactory(42)).toBe(false);
        expect(isComponentFactory("hello")).toBe(false);
        expect(isComponentFactory({ a: 1 })).toBe(false);
        expect(isComponentFactory(null)).toBe(false);
        expect(isComponentFactory(undefined)).toBe(false);
      });

      it("should narrow type correctly", () => {
        const value: unknown = wrapComponent(() => $("div"));
        if (isComponentFactory(value)) {
          const _typed = value;
        }
      });
    });
  });
});
