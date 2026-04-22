import { describe, test, expect, beforeEach } from "vitest";
import { $, Seidr, $factory, $getById, $query, $queryAll } from "@fimbul-works/seidr";
import { $div, $button, $span } from "@fimbul-works/seidr/html";

describe("docs/DOM.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("$() - Create DOM elements", () => {
    const disabled = new Seidr(false, { sync: true });

    const button = $(
      "button",
      {
        disabled,
        textContent: "Click me",
      },
      [],
    ) as HTMLButtonElement;

    document.body.appendChild(button);
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe("Click me");

    disabled.value = true;
    expect(button.disabled).toBe(true);
  });

  test("$factory()", () => {
    const $card = $factory("article");
    const card = $card({ className: "card" }, ["Content goes here"]);
    expect(card.tagName.toLowerCase()).toBe("article");
    expect(card.className).toBe("card");
    expect(card.textContent).toBe("Content goes here");

    const $checkbox = $factory("input", { type: "checkbox" });
    const agreeCheckbox = $checkbox({ id: "agree", checked: true }) as HTMLInputElement;
    expect(agreeCheckbox.type).toBe("checkbox");
    expect(agreeCheckbox.id).toBe("agree");
    expect(agreeCheckbox.checked).toBe(true);
  });

  test("Predefined Element Creators", () => {
    const count = new Seidr(0, { sync: true });

    const app = $div({ className: "app" }, [
      $button({
        textContent: "Increment",
        onclick: () => count.value++,
      }),
      $span({ textContent: count }),
    ]);

    document.body.appendChild(app);
    const span = app.querySelector("span")!;
    const btn = app.querySelector("button")!;

    expect(span.textContent).toBe("0");
    btn.click();
    expect(span.textContent).toBe("1");
  });

  test("DOM Query Utilities", () => {
    const div = document.createElement("div");
    div.id = "my-id";
    div.className = "item";
    document.body.appendChild(div);

    expect($getById("my-id")).toBe(div);
    expect($query("#my-id")).toBe(div);
    expect($queryAll(".item")).toContain(div);
  });
});
