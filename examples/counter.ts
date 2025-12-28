import { $button, $div, $span, component, mount, Seidr } from "../src/index.browser.js";

export function Counter() {
  return component(() => {
    const count = new Seidr(0);
    const disabled = count.as((value) => value >= 10);

    return $div(
      {
        className: "counter",
      },
      [
        // @ts-expect-error
        $span({ textContent: count }), // Automatic reactive binding!
        $button({
          textContent: "Increment",
          disabled, // Reactive boolean binding!
          onclick: () => count.value++,
        }),
        $button({
          textContent: "Reset",
          onclick: () => (count.value = 0),
        }),
      ],
    );
  });
}

// Mount component only in browser environment (not in tests)
if (typeof window !== "undefined") {
  mount(Counter(), document.body);
}
