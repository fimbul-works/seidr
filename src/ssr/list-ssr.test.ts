import { describe, expect, it } from "vitest";
import { List } from "../components/list";
import { SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { renderToString } from "./render-to-string";

describe("ssr limits", () => {
  it("should contain list comments", async () => {
    const { html } = await renderToString(() => {
      const items = new Seidr([1, 2, 3]);
      return $("div", null, [
        List(
          items,
          (item) => item,
          (item: Seidr<number>) => $("div", { textContent: `Item ${item.value}` }),
        ),
      ]);
    });
    expect(html).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}List`);
  });
});
