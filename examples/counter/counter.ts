import { createValue, mount } from "@fimbul-works/seidr";
import { $button, $div } from "@fimbul-works/seidr/html";

export const Counter = () => {
  const count = createValue(0);
  const disabled = count.as((value) => value >= 10);

  return $div(
    {
      className: "card card-centered counter",
    },
    [
      $div({ className: "number-display center", textContent: count.as((c) => c.toString()) }),
      $div({ className: "counter-controls" }, [
        $button({
          className: "btn btn-primary",
          textContent: "Increment",
          disabled, // Reactive boolean binding!
          onclick: () => count((c) => c + 1),
        }),
        $button({
          className: "btn",
          textContent: "Reset",
          onclick: () => count(0),
        }),
      ]),
    ],
  );
};

// Mount component
mount(Counter, document.body);