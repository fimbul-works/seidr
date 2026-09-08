import { mount, createValue } from "../src/index";
import { $button, $div, $span } from "../src/elements";

export const Counter = () => {
  const count = createValue(0);
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
          onclick: () => count((c) => c + 1),
        }),
        $button({
          className: "btn btn-secondary",
          textContent: "Reset",
          onclick: () => (count(0)),
        }),
      ]),
    ],
  );
};

// Mount component only in browser environment (not in tests)
if (!process.env.VITEST) {
  mount(Counter, document.body);
}
