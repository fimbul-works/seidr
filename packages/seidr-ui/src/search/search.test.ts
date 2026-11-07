import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createSearch, Search } from "./index.js";

describeDualMode("Search", ({ getDocument, isSSR }) => {
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

  it("should render default structure, roles, and semantic data attributes (Tier 1)", () => {
    const root = setup(() =>
      Search({
        id: "search-input",
        label: "Search Products",
        placeholder: "Type to query...",
        options: [
          { value: "prod-1", label: "Product 1" },
          { value: "prod-2", label: "Product 2" },
        ],
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("search");
    expect(rootEl.getAttribute("role")).toBe("group");

    const labelEl = root.querySelector("[data-part='label']") as HTMLElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.textContent).toBe("Search Products");

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl).not.toBeNull();
    expect(inputEl.getAttribute("role")).toBe("combobox");
    expect(inputEl.getAttribute("placeholder")).toBe("Type to query...");

    const indicatorEl = root.querySelector("[data-part='indicator']") as HTMLElement;
    expect(indicatorEl).not.toBeNull();
  });

  it("supports fine-grained composition via createSearch (Tier 2)", () => {
    const root = setup(() => {
      const search = createSearch({
        id: "custom-search",
        defaultValue: "opt-1",
        options: [{ value: "opt-1", label: "Option 1" }],
      });

      const item1 = search.createItem({ value: "opt-1" });

      return search.Root({}, [
        search.Label({}, "Custom Search"),
        search.Control({}, [
          search.Input(),
          search.Trigger({}, [search.Indicator({ loadingComponent: "..." }, "🔍")]),
        ]),
        search.Content({}, [
          search.Listbox({}, [
            item1.Root({}, [item1.Label({}, "Option 1")]),
            search.NoResult({}, "No matching options found"),
          ]),
        ]),
        search.HiddenSelect(),
      ]);
    });

    const rootEl = root.querySelector("[data-part='root']");
    expect(rootEl).not.toBeNull();
    expect(rootEl?.getAttribute("data-component")).toBe("search");

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl.value).toBe("Option 1");
  });

  it("triggers debounced onInputChange callback and toggles loading indicator", async () => {
    if (isSSR) return;

    vi.useFakeTimers();
    let resolveQuery: () => void;
    const asyncQuery = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveQuery = resolve;
        }),
    );

    const root = setup(() =>
      Search({
        id: "debounced-search",
        debounceOptionsMillisecond: 300,
        onInputChange: asyncQuery,
        loadingIndicator: "Loading...",
        indicator: "🔍",
        options: [],
      }),
    );

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    const indicatorEl = root.querySelector("[data-part='indicator']") as HTMLElement;

    expect(indicatorEl.textContent).toContain("🔍");

    // Type query
    inputEl.value = "shoes";
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));

    // Before debounce timer fires
    expect(asyncQuery).not.toHaveBeenCalled();

    // Fast-forward 300ms
    vi.advanceTimersByTime(300);
    expect(asyncQuery).toHaveBeenCalledWith("shoes");
    expect(indicatorEl.hasAttribute("data-loading")).toBe(true);
    expect(indicatorEl.textContent).toContain("Loading...");

    // Resolve async promise
    resolveQuery!();
    await Promise.resolve();
    await Promise.resolve();

    expect(indicatorEl.hasAttribute("data-loading")).toBe(false);
    expect(indicatorEl.textContent).toContain("🔍");

    vi.useRealTimers();
  });

  it("displays NoResult when options are empty", () => {
    if (isSSR) return;

    const root = setup(() =>
      Search({
        id: "empty-search",
        noResult: "No items match your query",
        options: [],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    triggerEl.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));

    const noResultEl = root.querySelector("[data-part='no-result']") as HTMLElement;
    expect(noResultEl).not.toBeNull();
    expect(noResultEl.textContent).toBe("No items match your query");
  });

  it("passes axe accessibility checks", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Search({
        id: "a11y-search",
        label: "Accessible Search",
        options: [
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
        ],
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});

