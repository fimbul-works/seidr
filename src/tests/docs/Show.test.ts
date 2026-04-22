import { describe, test, expect, beforeEach } from "vitest";
import { Show, Seidr, mount } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";

describe("docs/Show.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("Show Example", () => {
    const visible = new Seidr(true);
    const ConditionalPage = () => {
      return $div({}, [Show(visible, () => $div({ textContent: "I am visible!" }))]);
    };

    mount(ConditionalPage, document.body);
    expect(document.body.textContent).toContain("I am visible!");

    visible.value = false;
    expect(document.body.textContent).not.toContain("I am visible!");

    visible.value = true;
    expect(document.body.textContent).toContain("I am visible!");
  });
});
