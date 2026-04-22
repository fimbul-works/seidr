import { List, mount, Seidr } from "@fimbul-works/seidr";
import { $button, $div, $input, $li, $span, $ul } from "@fimbul-works/seidr/html";
import { beforeEach, describe, expect, test } from "vitest";

describe("README.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("Quick Start Example", async () => {
    const Counter = () => {
      const count = new Seidr(0);
      const disabled = count.as((value) => value >= 10);

      return $div(
        {
          className: "counter",
          style: "padding: 20px; border: 1px solid #ccc;",
        },
        [
          $span({ textContent: count }), // Automatic reactive binding
          $button({
            textContent: "Increment",
            disabled, // Reactive boolean binding
            onclick: () => count.value++,
          }),
          $button({
            textContent: "Reset",
            onclick: () => (count.value = 0),
          }),
        ],
      );
    };

    const cleanup = mount(Counter, document.body);

    const span = document.querySelector("span")!;
    const [incBtn, resetBtn] = document.querySelectorAll("button");

    expect(span.textContent).toBe("0");
    expect(incBtn.disabled).toBe(false);

    incBtn.click();
    expect(span.textContent).toBe("1");

    for (let i = 0; i < 9; i++) incBtn.click();
    expect(span.textContent).toBe("10");
    expect(incBtn.disabled).toBe(true);

    resetBtn.click();
    expect(span.textContent).toBe("0");
    expect(incBtn.disabled).toBe(false);

    cleanup();
    expect(document.body.innerHTML).toBe("");
  });

  test("SearchApp Example", () => {
    const SearchApp = () => {
      const searchQuery = new Seidr("");
      const items = new Seidr([
        { id: 1, name: "Apple" },
        { id: 2, name: "Banana" },
        { id: 3, name: "Cherry" },
      ]);

      const filteredItems = Seidr.merge(() => {
        const query = searchQuery.value.toLowerCase();
        return query ? items.value.filter((item) => item.name.toLowerCase().includes(query)) : items.value;
      }, [items, searchQuery]);

      const searchInput = $input({
        type: "text",
        placeholder: "Search...",
        value: searchQuery,
        oninput: (e: any) => (searchQuery.value = e.target.value),
      });

      return $div({}, [
        searchInput,
        $ul({}, [
          List(
            filteredItems,
            (item) => item.id,
            (item) => $li({ textContent: item.as((i) => i.name) }),
          ),
        ]),
      ]);
    };

    mount(SearchApp, document.body);

    const input = document.querySelector("input")!;
    const list = document.querySelector("ul")!;

    expect(list.children.length).toBe(3);

    input.value = "app";
    input.dispatchEvent(new Event("input"));

    expect(list.children.length).toBe(1);
    expect(list.textContent).toContain("Apple");

    input.value = "a";
    input.dispatchEvent(new Event("input"));
    expect(list.children.length).toBe(2);
    expect(list.textContent).toContain("Apple");
    expect(list.textContent).toContain("Banana");
  });
});
