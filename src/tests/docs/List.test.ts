import { List, mount, Seidr } from "@fimbul-works/seidr";
import { $li, $ul } from "@fimbul-works/seidr/html";
import { beforeEach, describe, expect, test } from "vitest";

describe("docs/List.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("Basic List Example", () => {
    const items = new Seidr([{ id: 1, text: "Item 1" }]);
    const Item = ({ text }: { text: string | Seidr<string> }) => $li({ textContent: text });

    const ListPage = () => {
      return $ul({}, [
        List<{ id: number; text: string }>(
          items,
          (i) => i.id,
          (i) => Item({ text: i.as((v) => v.text) }),
        ),
      ]);
    };

    mount(ListPage, document.body);

    const ul = document.querySelector("ul")!;
    expect(ul.children.length).toBe(1);
    expect(ul.textContent).toBe("Item 1");

    items.value = [...items.value, { id: 2, text: "Item 2" }];
    expect(ul.children.length).toBe(2);
    expect(ul.textContent).toBe("Item 1Item 2");
  });
});
