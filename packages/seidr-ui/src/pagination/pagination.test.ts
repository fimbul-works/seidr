import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createPagination, Pagination } from "./index.js";

describeDualMode("Pagination", ({ getDocument, isSSR }) => {
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

  const isButtonDisabled = (el: HTMLButtonElement | null) => {
    if (!el) return false;
    return isSSR ? el.hasAttribute("disabled") : el.disabled;
  };

  it("renders with default structure, roles, and semantic data attributes", () => {
    const root = setup(() =>
      Pagination({
        count: 5,
        defaultPage: 1,
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const listEl = root.querySelector("[data-part='list']") as HTMLElement;
    const prevBtn = root.querySelector("[data-part='previous']") as HTMLButtonElement;
    const nextBtn = root.querySelector("[data-part='next']") as HTMLButtonElement;
    const itemButtons = Array.from(root.querySelectorAll("[data-part='item']")) as HTMLButtonElement[];

    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("pagination");
    expect(rootEl.getAttribute("aria-label")).toBe("Pagination");

    expect(listEl).not.toBeNull();
    expect(listEl.getAttribute("data-component")).toBe("pagination");

    expect(prevBtn).not.toBeNull();
    expect(prevBtn.getAttribute("data-component")).toBe("pagination");
    expect(isButtonDisabled(prevBtn)).toBe(true);

    expect(nextBtn).not.toBeNull();
    expect(nextBtn.getAttribute("data-component")).toBe("pagination");
    expect(isButtonDisabled(nextBtn)).toBe(false);

    expect(itemButtons.length).toBe(5);
    expect(itemButtons[0].getAttribute("aria-current")).toBe("page");
    expect(itemButtons[0].hasAttribute("data-current")).toBe(true);
    expect(itemButtons[1].getAttribute("aria-current")).toBeNull();
  });

  it("passes axe accessibility checks", async () => {
    const root = setup(() =>
      Pagination({
        count: 5,
        defaultPage: 2,
      }),
    );

    if (isSSR) return;

    // @ts-expect-error vitest-axe types
    expect(await axe(root)).toHaveNoViolations();
  });

  it("supports fine-grained composition via createPagination (Tier 2)", () => {
    const root = setup(() => {
      const pg = createPagination({ count: 4, defaultPage: 2 });
      return pg.Root({}, [pg.List({}, [pg.Previous({}, "Prev"), pg.Items(), pg.Next({}, "Next")])]);
    });

    const prevBtn = root.querySelector("[data-part='previous']") as HTMLButtonElement;
    const nextBtn = root.querySelector("[data-part='next']") as HTMLButtonElement;
    const items = Array.from(root.querySelectorAll("[data-part='item']")) as HTMLButtonElement[];

    expect(prevBtn?.textContent).toBe("Prev");
    expect(nextBtn?.textContent).toBe("Next");
    expect(items.length).toBe(4);
    expect(items[1].getAttribute("aria-current")).toBe("page");
  });

  it("navigates pages on clicking page items", () => {
    const onPageChange = vi.fn();
    const root = setup(() =>
      Pagination({
        count: 5,
        defaultPage: 1,
        onPageChange,
      }),
    );

    const itemButtons = Array.from(root.querySelectorAll("[data-part='item']")) as HTMLButtonElement[];

    if (isSSR) return;

    itemButtons[2].click();
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(itemButtons[2].getAttribute("aria-current")).toBe("page");
  });

  it("navigates forward and backward with Next and Previous buttons", () => {
    const onPageChange = vi.fn();
    const root = setup(() =>
      Pagination({
        count: 3,
        defaultPage: 1,
        onPageChange,
      }),
    );

    const prevBtn = root.querySelector("[data-part='previous']") as HTMLButtonElement;
    const nextBtn = root.querySelector("[data-part='next']") as HTMLButtonElement;

    if (isSSR) return;

    expect(isButtonDisabled(prevBtn)).toBe(true);
    expect(isButtonDisabled(nextBtn)).toBe(false);

    nextBtn.click();
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(isButtonDisabled(prevBtn)).toBe(false);
    expect(isButtonDisabled(nextBtn)).toBe(false);

    nextBtn.click();
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(isButtonDisabled(prevBtn)).toBe(false);
    expect(isButtonDisabled(nextBtn)).toBe(true);

    prevBtn.click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calculates ellipses correctly for large page counts (count=7, page=1 through page=4)", () => {
    const root = setup(() =>
      Pagination({
        count: 7,
        defaultPage: 1,
      }),
    );

    const nextBtn = root.querySelector("[data-part='next']") as HTMLButtonElement;

    // At page 1: [Page 1, Page 2, Ellipsis, Page 7]
    let items = Array.from(root.querySelectorAll("[data-part='item']")).map((el) => el.textContent);
    let ellipses = Array.from(root.querySelectorAll("[data-part='ellipsis']"));
    expect(items).toEqual(["1", "2", "7"]);
    expect(ellipses.length).toBe(1);

    if (isSSR) return;

    // Step to page 2: [Page 1, Page 2, Page 3, Ellipsis, Page 7]
    nextBtn.click();
    items = Array.from(root.querySelectorAll("[data-part='item']")).map((el) => el.textContent);
    ellipses = Array.from(root.querySelectorAll("[data-part='ellipsis']"));
    expect(items).toEqual(["1", "2", "3", "7"]);
    expect(ellipses.length).toBe(1);

    // Step to page 3: [Page 1, Page 2, Page 3, Page 4, Ellipsis, Page 7]
    nextBtn.click();
    items = Array.from(root.querySelectorAll("[data-part='item']")).map((el) => el.textContent);
    ellipses = Array.from(root.querySelectorAll("[data-part='ellipsis']"));
    expect(items).toEqual(["1", "2", "3", "4", "7"]);
    expect(ellipses.length).toBe(1);

    // Step to page 4: [Page 1, Ellipsis, Page 3, Page 4, Page 5, Ellipsis, Page 7]
    nextBtn.click();
    items = Array.from(root.querySelectorAll("[data-part='item']")).map((el) => el.textContent);
    ellipses = Array.from(root.querySelectorAll("[data-part='ellipsis']"));
    expect(items).toEqual(["1", "3", "4", "5", "7"]);
    expect(ellipses.length).toBe(2);
  });

  it("respects siblingCount option", () => {
    const root = setup(() =>
      Pagination({
        count: 10,
        defaultPage: 5,
        siblingCount: 2,
      }),
    );

    const items = Array.from(root.querySelectorAll("[data-part='item']")).map((el) => el.textContent);
    const ellipses = Array.from(root.querySelectorAll("[data-part='ellipsis']"));

    // Page 1, Ellipsis, 3, 4, 5, 6, 7, Ellipsis, 10
    expect(items).toEqual(["1", "3", "4", "5", "6", "7", "10"]);
    expect(ellipses.length).toBe(2);
  });

  it("supports hiding first and last page buttons", () => {
    const root = setup(() =>
      Pagination({
        count: 10,
        defaultPage: 5,
        showFirst: false,
        showLast: false,
      }),
    );

    const items = Array.from(root.querySelectorAll("[data-part='item']")).map((el) => el.textContent);
    expect(items).not.toContain("1");
    expect(items).not.toContain("10");
    expect(items).toEqual(["4", "5", "6"]);
  });

  it("supports fixedItems option to keep element count constant", () => {
    const root = setup(() =>
      Pagination({
        count: 10,
        defaultPage: 3,
        fixedItems: true,
      }),
    );

    const items = Array.from(root.querySelectorAll("[data-part='item']")).map((el) => el.textContent);
    expect(items).toEqual(["1", "2", "3", "4", "5", "10"]);
  });

  it("supports controlled state via reactive Value", () => {
    const controlledPage = createValue(2, { id: "test-pagination-page" });
    const onPageChange = vi.fn();

    const root = setup(() =>
      Pagination({
        count: 5,
        page: controlledPage,
        onPageChange,
      }),
    );

    const itemButtons = Array.from(root.querySelectorAll("[data-part='item']")) as HTMLButtonElement[];
    expect(itemButtons[1].getAttribute("aria-current")).toBe("page");

    if (isSSR) return;

    controlledPage(4);
    expect(itemButtons[3].getAttribute("aria-current")).toBe("page");

    const prevBtn = root.querySelector("[data-part='previous']") as HTMLButtonElement;
    prevBtn.click();
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("supports disabled state", () => {
    const root = setup(() =>
      Pagination({
        count: 5,
        defaultPage: 2,
        disabled: true,
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const prevBtn = root.querySelector("[data-part='previous']") as HTMLButtonElement;
    const nextBtn = root.querySelector("[data-part='next']") as HTMLButtonElement;
    const itemButtons = Array.from(root.querySelectorAll("[data-part='item']")) as HTMLButtonElement[];

    expect(rootEl.hasAttribute("data-disabled")).toBe(true);
    expect(isButtonDisabled(prevBtn)).toBe(true);
    expect(isButtonDisabled(nextBtn)).toBe(true);
    expect(itemButtons.every((btn) => isButtonDisabled(btn))).toBe(true);

    if (isSSR) return;

    itemButtons[3].click();
    expect(itemButtons[1].getAttribute("aria-current")).toBe("page");
  });
});
