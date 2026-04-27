import { $, mount, Seidr } from "@fimbul-works/seidr";

export const HelloWorld = () => {
  const textContent = new Seidr("Click me");

  return $("button", {
    className: "btn",
    textContent, // Reactive value binding
    onclick: () => (textContent.value = "Seidr binds thee"),
  });
};

// Mount component only in browser environment (not in tests)
if (!process.env.VITEST) {
  mount(HelloWorld, document.body);
}
