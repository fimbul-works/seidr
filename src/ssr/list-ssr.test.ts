import { describe, expect, it } from "vitest";
import { List } from "../components/list";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { str } from "../util/string";
import { renderToString } from "./render-to-string";

describe("ssr limits", () => {
  it("should contain list comments", async () => {
    const { html } = await renderToString(() => {
      const items = new Seidr([1, 2, 3]);
      return $("div", null, [
        List(
          items,
          (item) => str(item),
          (item) => $("div", { textContent: `Item ${item}` }),
        ),
      ]);
    });
    expect(html).toContain("<!--List");
  });
});
