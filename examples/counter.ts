import { $button, $div, $span, isClient, mount, Seidr } from "../src/index.browser.js";

export const Counter = () => {
  const count = new Seidr(0);
  const disabled = count.as((value) => value >= 10);

  return $div(
    {
      className: "card card-centered counter",
    },
    [
      $span({ className: "counter-display", textContent: count.as((c) => c.toString()) }),
      $div({ className: "counter-controls" }, [
        $button({
          className: "btn btn-primary",
          textContent: "Increment",
          disabled, // Reactive boolean binding!
          onclick: () => count.value++,
        }),
        $button({
          className: "btn btn-secondary",
          textContent: "Reset",
          onclick: () => (count.value = 0),
        }),
      ]),
    ],
  );
};

// Mount component only in browser environment (not in tests)
if (isClient()) {
  mount(Counter, document.body);
}
