import { $, isClient, mount, Seidr } from "../src/index.core.js";

export const HelloWorld = () => {
  const textContent = new Seidr("Click me");

  return $("button", {
    className: "btn",
    textContent,
    onclick: () => (textContent.value = "Seidr binds thee"),
  });
};

// Mount component only in browser environment (not in tests)
if (isClient()) {
  mount(HelloWorld, document.body);
}
