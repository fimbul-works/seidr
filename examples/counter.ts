import { $button, $div, $getById, $span, component, mount, Seidr } from "../src";

function Counter() {
  return component((scope) => {
    const count = new Seidr(0);
    const disabled = count.as((value) => value >= 10);

    return $div(
      {
        className: "counter",
        style: "padding: 20px; border: 1px solid #ccc;",
      },
      [
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
if (typeof document !== "undefined") {
  const app = $getById("app");
  if (app) {
    mount(Counter(), app);
  }
}

export { Counter };
