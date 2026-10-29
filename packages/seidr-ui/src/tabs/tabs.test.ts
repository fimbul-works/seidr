import { createComponent, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createTabs, Tabs } from "./index.js";

describeDualMode("Tabs", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => SeidrChild) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  it("should render default structure, roles, and semantic data attributes", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "test-tabs" });
      return tabs.Root({}, [
        tabs.List({}, [
          tabs.Trigger({ value: "tab1" }, "Tab 1"),
          tabs.Trigger({ value: "tab2" }, "Tab 2"),
          tabs.Indicator({}),
        ]),
        tabs.Content({ value: "tab1" }, "Content 1"),
        tabs.Content({ value: "tab2" }, "Content 2"),
      ]);
    });

    const rootEl = root.querySelector("#test-tabs") as HTMLElement;
    const listEl = root.querySelector("[role='tablist']") as HTMLElement;
    const triggers = root.querySelectorAll("[role='tab']");
    const indicator = root.querySelector("[role='presentation']");
    const content1 = root.querySelector("#test-tabs-content-tab1");

    expect(rootEl).not.toBeNull();
    expect(listEl).not.toBeNull();
    expect(triggers.length).toBe(2);
    expect(indicator).not.toBeNull();
    expect(content1).not.toBeNull();

    // Semantic dataComponent and dataPart annotations
    expect(rootEl.getAttribute("data-component")).toBe("tabs");
    expect(rootEl.getAttribute("data-part")).toBe("root");
    expect(listEl.getAttribute("data-component")).toBe("tabs");
    expect(listEl.getAttribute("data-part")).toBe("list");
    expect(triggers[0]?.getAttribute("data-component")).toBe("tabs");
    expect(triggers[0]?.getAttribute("data-part")).toBe("trigger");
    expect(indicator?.getAttribute("data-component")).toBe("tabs");
    expect(indicator?.getAttribute("data-part")).toBe("indicator");
    expect(content1?.getAttribute("data-component")).toBe("tabs");
    expect(content1?.getAttribute("data-part")).toBe("content");

    // WAI-ARIA and orientation
    expect(listEl.getAttribute("aria-orientation")).toBe("horizontal");
    expect(rootEl.getAttribute("data-orientation")).toBe("horizontal");
    expect(triggers[0]?.getAttribute("aria-selected")).toBe("true");
    expect(triggers[1]?.getAttribute("aria-selected")).toBe("false");
    expect(triggers[0]?.getAttribute("aria-controls")).toBe("test-tabs-content-tab1");
    expect(content1?.getAttribute("aria-labelledby")).toBe("test-tabs-trigger-tab1");
  });

  it("should support default initial selection", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "my-tabs", defaultValue: "profile" });
      return tabs.Root({}, [
        tabs.List({}, [tabs.Trigger({ value: "account" }, "Account"), tabs.Trigger({ value: "profile" }, "Profile")]),
        tabs.Content({ value: "account" }, "Account settings"),
        tabs.Content({ value: "profile" }, "Profile details"),
      ]);
    });

    const accountTrigger = root.querySelector("#my-tabs-trigger-account");
    const profileTrigger = root.querySelector("#my-tabs-trigger-profile");
    const profileContent = root.querySelector("#my-tabs-content-profile");
    const accountContent = root.querySelector("#my-tabs-content-account");

    expect(profileTrigger?.getAttribute("aria-selected")).toBe("true");
    expect(accountTrigger?.getAttribute("aria-selected")).toBe("false");
    expect(profileContent).not.toBeNull();
    expect(accountContent).toBeNull();
  });

  it("should switch tabs on trigger click", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "click-tabs" });
      return tabs.Root({}, [
        tabs.List({}, [tabs.Trigger({ value: "tab1" }, "Tab 1"), tabs.Trigger({ value: "tab2" }, "Tab 2")]),
        tabs.Content({ value: "tab1" }, "Content 1"),
        tabs.Content({ value: "tab2" }, "Content 2"),
      ]);
    });

    const trigger1 = root.querySelector("#click-tabs-trigger-tab1") as HTMLButtonElement;
    const trigger2 = root.querySelector("#click-tabs-trigger-tab2") as HTMLButtonElement;

    expect(trigger1.getAttribute("aria-selected")).toBe("true");
    expect(root.querySelector("#click-tabs-content-tab1")).not.toBeNull();
    expect(root.querySelector("#click-tabs-content-tab2")).toBeNull();

    if (!isSSR) {
      trigger2.click();

      expect(trigger1.getAttribute("aria-selected")).toBe("false");
      expect(trigger2.getAttribute("aria-selected")).toBe("true");
      expect(root.querySelector("#click-tabs-content-tab1")).toBeNull();
      expect(root.querySelector("#click-tabs-content-tab2")).not.toBeNull();
    }
  });

  it("should support forceMount on content panels", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "fm-tabs", defaultValue: "tab1" });
      return tabs.Root({}, [
        tabs.List({}, [tabs.Trigger({ value: "tab1" }, "Tab 1"), tabs.Trigger({ value: "tab2" }, "Tab 2")]),
        tabs.Content({ value: "tab1", forceMount: true }, "Content 1"),
        tabs.Content({ value: "tab2", forceMount: true }, "Content 2"),
      ]);
    });

    const content1 = root.querySelector("#fm-tabs-content-tab1") as HTMLElement;
    const content2 = root.querySelector("#fm-tabs-content-tab2") as HTMLElement;

    expect(content1).not.toBeNull();
    expect(content2).not.toBeNull();

    expect(content1.hasAttribute("hidden")).toBe(false);
    expect(content2.hasAttribute("hidden")).toBe(true);

    if (!isSSR) {
      const trigger2 = root.querySelector("#fm-tabs-trigger-tab2") as HTMLButtonElement;
      trigger2.click();

      expect(content1.hasAttribute("hidden")).toBe(true);
      expect(content2.hasAttribute("hidden")).toBe(false);
    }
  });

  it("should support vertical orientation", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "vert-tabs", orientation: "vertical" });
      return tabs.Root({}, [
        tabs.List({}, [tabs.Trigger({ value: "v1" }, "V 1"), tabs.Trigger({ value: "v2" }, "V 2")]),
        tabs.Content({ value: "v1" }, "Content V1"),
      ]);
    });

    const rootEl = root.querySelector("#vert-tabs");
    const listEl = root.querySelector("[role='tablist']");

    expect(rootEl?.getAttribute("data-orientation")).toBe("vertical");
    expect(listEl?.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("should prevent selection on disabled tabs", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "dis-tabs" });
      return tabs.Root({}, [
        tabs.List({}, [
          tabs.Trigger({ value: "tab1" }, "Tab 1"),
          tabs.Trigger({ value: "tab2", disabled: true }, "Tab 2"),
        ]),
        tabs.Content({ value: "tab1" }, "Content 1"),
        tabs.Content({ value: "tab2" }, "Content 2"),
      ]);
    });

    const trigger2 = root.querySelector("#dis-tabs-trigger-tab2") as HTMLButtonElement;

    expect(trigger2.getAttribute("aria-disabled")).toBe("true");
    expect(trigger2.hasAttribute("disabled")).toBe(true);
    expect(trigger2.hasAttribute("data-disabled")).toBe(true);

    if (!isSSR) {
      trigger2.click();
      expect(trigger2.getAttribute("aria-selected")).toBe("false");
      expect(root.querySelector("#dis-tabs-content-tab2")).toBeNull();
    }
  });

  it("should handle roving tabindex and arrow keys in automatic mode", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "nav-tabs" });
      return tabs.Root({}, [
        tabs.List({}, [
          tabs.Trigger({ value: "tab1" }, "Tab 1"),
          tabs.Trigger({ value: "tab2" }, "Tab 2"),
          tabs.Trigger({ value: "tab3" }, "Tab 3"),
        ]),
        tabs.Content({ value: "tab1" }, "Content 1"),
        tabs.Content({ value: "tab2" }, "Content 2"),
        tabs.Content({ value: "tab3" }, "Content 3"),
      ]);
    });

    const trigger1 = root.querySelector("#nav-tabs-trigger-tab1") as HTMLButtonElement;
    const trigger2 = root.querySelector("#nav-tabs-trigger-tab2") as HTMLButtonElement;
    const trigger3 = root.querySelector("#nav-tabs-trigger-tab3") as HTMLButtonElement;

    expect(String(trigger1.getAttribute("tabindex"))).toBe("0");
    expect(String(trigger2.getAttribute("tabindex"))).toBe("-1");
    expect(String(trigger3.getAttribute("tabindex"))).toBe("-1");

    if (!isSSR) {
      // ArrowRight from tab1 -> tab2
      trigger1.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      expect(trigger2.getAttribute("aria-selected")).toBe("true");
      expect(trigger2.getAttribute("tabindex")).toBe("0");
      expect(trigger1.getAttribute("tabindex")).toBe("-1");

      // End key -> tab3
      trigger2.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(trigger3.getAttribute("aria-selected")).toBe("true");

      // ArrowRight from tab3 wraps to tab1
      trigger3.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(trigger1.getAttribute("aria-selected")).toBe("true");

      // Home key -> tab1
      trigger1.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(trigger1.getAttribute("aria-selected")).toBe("true");
    }
  });

  it("should handle manual activation mode", () => {
    const root = setup(() => {
      const tabs = createTabs({ id: "manual-tabs", activationMode: "manual" });
      return tabs.Root({}, [
        tabs.List({}, [tabs.Trigger({ value: "tab1" }, "Tab 1"), tabs.Trigger({ value: "tab2" }, "Tab 2")]),
        tabs.Content({ value: "tab1" }, "Content 1"),
        tabs.Content({ value: "tab2" }, "Content 2"),
      ]);
    });

    const trigger1 = root.querySelector("#manual-tabs-trigger-tab1") as HTMLButtonElement;
    const trigger2 = root.querySelector("#manual-tabs-trigger-tab2") as HTMLButtonElement;

    if (!isSSR) {
      // In manual mode, ArrowRight changes focus but NOT selected tab
      trigger1.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      expect(trigger1.getAttribute("aria-selected")).toBe("true");
      expect(trigger2.getAttribute("aria-selected")).toBe("false");
      expect(trigger2.getAttribute("tabindex")).toBe("0");

      // Pressing Enter activates tab2
      trigger2.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

      expect(trigger1.getAttribute("aria-selected")).toBe("false");
      expect(trigger2.getAttribute("aria-selected")).toBe("true");
      expect(root.querySelector("#manual-tabs-content-tab2")).not.toBeNull();
    }
  });

  it("should support all-in-one Tabs component with items and indicator", () => {
    const root = setup(() =>
      Tabs({
        id: "aio-tabs",
        defaultValue: "music",
        indicator: true,
        items: [
          { value: "music", trigger: "Music", content: "Music Content" },
          { value: "podcasts", trigger: "Podcasts", content: "Podcasts Content" },
          { value: "live", trigger: "Live", content: "Live Content", disabled: true },
        ],
      }),
    );

    const rootEl = root.querySelector("#aio-tabs");
    const listEl = root.querySelector("[role='tablist']");
    const triggers = root.querySelectorAll("[role='tab']");
    const indicator = root.querySelector("[data-part='indicator']");
    const content = root.querySelector("#aio-tabs-content-music");

    expect(rootEl).not.toBeNull();
    expect(listEl).not.toBeNull();
    expect(triggers.length).toBe(3);
    expect(indicator).not.toBeNull();
    expect(content?.textContent).toBe("Music Content");

    expect(triggers[0]?.getAttribute("aria-selected")).toBe("true");
    expect(triggers[2]?.hasAttribute("disabled")).toBe(true);
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return; // Axe requires full DOM

    const root = setup(() =>
      Tabs({
        id: "axe-tabs",
        items: [
          { value: "first", trigger: "First Tab", content: "First Panel" },
          { value: "second", trigger: "Second Tab", content: "Second Panel" },
        ],
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });
});
