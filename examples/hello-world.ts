import { $, createValue, mount } from "../src/index";

// Seidr components are just pure functions.
export const HelloWorld = () => {
  // Create a reactive value.
  const textContent = createValue("Click Me");

  // $() returns pure DOM elements.
  return $("button", {
    className: "btn btn-primary",
    textContent, // Reactive binding is handled automatically.
    onclick: () => textContent("Seidr flows through the DOM"), // Update the reactive value.
  });
};

// In non-test environment, mount the component to the DOM.
if (!process.env.VITEST) {
  mount(HelloWorld, document.body);
}
