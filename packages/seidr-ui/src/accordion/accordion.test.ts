import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Accordion, createAccordion } from "./index.js";

const DEFAULT_ITEMS = [
  { value: "one", trigger: "Trigger One", content: "Content One" },
  { value: "two", trigger: "Trigger Two", content: "Content Two" },
  { value: "three", trigger: "Trigger Three", content: "Content Three" },
];

describeDualMode("Accordion", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => any) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  it("should render default structure, semantic annotations, and WAI-ARIA attributes", () => {
    const root = setup(() =>
      Accordion({
        defaultValue: ["one"],
        items: DEFAULT_ITEMS,
      }),
    );

    const accordionRoot = root.querySelector('[data-part="root"]')!;
    expect(accordionRoot).not.toBeNull();
    expect(accordionRoot.getAttribute("data-component")).toBe("accordion");

    const headers = root.querySelectorAll("h3");
    expect(headers.length).toBe(3);
    expect(headers[0].getAttribute("data-component")).toBe("accordion");
    expect(headers[0].getAttribute("data-part")).toBe("header");

    const triggers = root.querySelectorAll("button");
    expect(triggers.length).toBe(3);

    const [firstTrigger, secondTrigger, thirdTrigger] = Array.from(triggers);

    expect(firstTrigger.getAttribute("data-component")).toBe("accordion");
    expect(firstTrigger.getAttribute("data-part")).toBe("trigger");
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(firstTrigger.hasAttribute("data-expanded")).toBe(true);
    expect(firstTrigger.hasAttribute("data-closed")).toBe(false);
    expect(firstTrigger.getAttribute("data-key")).toBe("one");

    expect(secondTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(secondTrigger.hasAttribute("data-closed")).toBe(true);
    expect(secondTrigger.getAttribute("data-key")).toBe("two");

    expect(thirdTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(thirdTrigger.hasAttribute("data-closed")).toBe(true);
    expect(thirdTrigger.getAttribute("data-key")).toBe("three");

    const contentOne = root.querySelector('[role="region"]')!;
    expect(contentOne).not.toBeNull();
    expect(contentOne.textContent).toBe("Content One");
    expect(contentOne.getAttribute("data-component")).toBe("accordion");
    expect(contentOne.getAttribute("data-part")).toBe("content");
    expect(contentOne.getAttribute("aria-labelledby")).toBe(firstTrigger.id);
    expect(firstTrigger.getAttribute("aria-controls")).toBe(contentOne.id);
  });

  it("should support fine-grained Tier 2 coordinator via createAccordion", () => {
    const root = setup(() => {
      const accordion = createAccordion({ defaultValue: ["two"] });

      return accordion.Root({}, [
        accordion.Item({ value: "one", trigger: "Title 1", content: "Body 1" }),
        accordion.Item({ value: "two", trigger: "Title 2", content: "Body 2" }),
      ]);
    });

    const triggers = root.querySelectorAll("button");
    expect(triggers.length).toBe(2);
    expect(triggers[0].getAttribute("aria-expanded")).toBe("false");
    expect(triggers[1].getAttribute("aria-expanded")).toBe("true");

    const contentTwo = root.querySelector('[role="region"]')!;
    expect(contentTwo).not.toBeNull();
    expect(contentTwo.textContent).toBe("Body 2");
  });

  it("should support createItem helper for fine-grained subcomponent instances", () => {
    const root = setup(() => {
      const accordion = createAccordion({ defaultValue: ["faq-1"] });
      const item1 = accordion.createItem({ value: "faq-1" });
      const item2 = accordion.createItem({ value: "faq-2" });

      return accordion.Root({}, [
        item1.Root({}, [
          item1.Header({}, [item1.Trigger({}, "FAQ 1 Question")]),
          item1.Content({}, "FAQ 1 Answer"),
        ]),
        item2.Root({}, [
          item2.Header({}, [item2.Trigger({}, "FAQ 2 Question")]),
          item2.Content({}, "FAQ 2 Answer"),
        ]),
      ]);
    });

    const triggers = root.querySelectorAll("button");
    expect(triggers.length).toBe(2);
    expect(triggers[0].getAttribute("aria-expanded")).toBe("true");
    expect(triggers[1].getAttribute("aria-expanded")).toBe("false");
  });

  if (!isSSR) {
    it("should toggle between items in single mode and stay open if not collapsible", () => {
      const onChangeSpy = vi.fn();
      const root = setup(() =>
        Accordion({
          onChange: onChangeSpy,
          items: DEFAULT_ITEMS,
        }),
      );

      const triggers = root.querySelectorAll("button");
      const [firstTrigger, secondTrigger] = Array.from(triggers);

      // Click first item to open
      firstTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(onChangeSpy).toHaveBeenCalledWith(["one"]);

      // Click first item again - should NOT collapse because collapsible is false by default
      firstTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(onChangeSpy).toHaveBeenCalledTimes(1);

      // Click second item - first closes, second opens
      secondTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
      expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(onChangeSpy).toHaveBeenCalledWith(["two"]);
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
    });

    it("should toggle open and closed in single mode when collapsible is true", () => {
      const onChangeSpy = vi.fn();
      const root = setup(() =>
        Accordion({
          collapsible: true,
          defaultValue: ["one"],
          onChange: onChangeSpy,
          items: DEFAULT_ITEMS,
        }),
      );

      const firstTrigger = root.querySelectorAll("button")[0];
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");

      // Click open item - should collapse
      firstTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
      expect(onChangeSpy).toHaveBeenCalledWith([]);

      // Click closed item - should reopen
      firstTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(onChangeSpy).toHaveBeenCalledWith(["one"]);
    });

    it("should support multiple open items when multiple is true", () => {
      const onChangeSpy = vi.fn();
      const root = setup(() =>
        Accordion({
          multiple: true,
          onChange: onChangeSpy,
          items: DEFAULT_ITEMS,
        }),
      );

      const triggers = root.querySelectorAll("button");
      const [firstTrigger, secondTrigger] = Array.from(triggers);

      firstTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(onChangeSpy).toHaveBeenCalledWith(["one"]);

      secondTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(onChangeSpy).toHaveBeenCalledWith(["one", "two"]);

      // Collapsing first item leaves second item open
      firstTrigger.click();
      expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
      expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
      expect(onChangeSpy).toHaveBeenCalledWith(["two"]);
    });

    it("should support controlled reactive Value<string[]>", () => {
      const selectedKeys = createValue(["one"]);
      const root = setup(() =>
        Accordion({
          value: selectedKeys,
          items: DEFAULT_ITEMS,
        }),
      );

      const triggers = root.querySelectorAll("button");
      expect(triggers[0].getAttribute("aria-expanded")).toBe("true");
      expect(triggers[1].getAttribute("aria-expanded")).toBe("false");

      selectedKeys(["two"]);
      expect(triggers[0].getAttribute("aria-expanded")).toBe("false");
      expect(triggers[1].getAttribute("aria-expanded")).toBe("true");
    });

    it("should not open when item is disabled", () => {
      const root = setup(() =>
        Accordion({
          items: [
            { value: "one", trigger: "One", content: "Content 1" },
            { value: "two", trigger: "Two", content: "Content 2", disabled: true },
          ],
        }),
      );

      const triggers = root.querySelectorAll("button");
      const disabledTrigger = triggers[1];

      expect(disabledTrigger.disabled).toBe(true);
      expect(disabledTrigger.getAttribute("aria-disabled")).toBe("true");
      expect(disabledTrigger.hasAttribute("data-disabled")).toBe(true);

      disabledTrigger.click();
      expect(disabledTrigger.getAttribute("aria-expanded")).toBe("false");
    });

    it("should navigate headers via ArrowDown, ArrowUp, Home, and End keys", () => {
      const root = setup(() =>
        Accordion({
          shouldFocusWrap: true,
          items: DEFAULT_ITEMS,
        }),
      );

      const triggers = root.querySelectorAll("button");
      const [first, second, third] = Array.from(triggers);

      first.focus();
      expect(getDocument().activeElement).toBe(first);

      // ArrowDown -> second
      first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(getDocument().activeElement).toBe(second);

      // ArrowDown -> third
      second.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(getDocument().activeElement).toBe(third);

      // ArrowDown wraps -> first
      third.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(getDocument().activeElement).toBe(first);

      // ArrowUp wraps -> third
      first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(getDocument().activeElement).toBe(third);

      // Home -> first
      third.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(getDocument().activeElement).toBe(first);

      // End -> third
      first.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(getDocument().activeElement).toBe(third);
    });

    it("should not wrap focus when shouldFocusWrap is false", () => {
      const root = setup(() =>
        Accordion({
          shouldFocusWrap: false,
          items: DEFAULT_ITEMS,
        }),
      );

      const triggers = root.querySelectorAll("button");
      const [first, , third] = Array.from(triggers);

      first.focus();
      expect(getDocument().activeElement).toBe(first);

      // ArrowUp at start should stay at first
      first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(getDocument().activeElement).toBe(first);

      third.focus();
      expect(getDocument().activeElement).toBe(third);

      // ArrowDown at end should stay at third
      third.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(getDocument().activeElement).toBe(third);
    });

    it("should pass axe accessibility checks", async () => {
      const root = setup(() =>
        Accordion({
          defaultValue: ["one"],
          items: DEFAULT_ITEMS,
        }),
      );

      // @ts-expect-error vitest-axe types
      expect(await axe(root)).toHaveNoViolations();
    });

    it("should expose CSS animation custom properties on content", () => {
      const root = setup(() =>
        Accordion({
          defaultValue: ["one"],
          items: DEFAULT_ITEMS,
        }),
      );

      const content = root.querySelector('[role="region"]') as HTMLElement;
      expect(content).not.toBeNull();
      expect(content.style.getPropertyValue("--seidr-accordion-content-height")).toContain("var(--seidr-collapsible-content-height)");
    });

    it("should accept custom Flaedi animation options", () => {
      const root = setup(() =>
        Accordion({
          defaultValue: ["one"],
          animation: {
            duration: 350,
            easing: (t) => t,
          },
          items: DEFAULT_ITEMS,
        }),
      );

      const content = root.querySelector('[role="region"]') as HTMLElement;
      expect(content).not.toBeNull();
      expect(content.getAttribute("data-expanded")).toBe("");
    });
  }
});
