import { $, createValue } from "@fimbul-works/seidr";

// Create a reactive value.
const textContent = createValue("Click Me");

// $() returns pure DOM elements and handles reactive bindings automatically.
export const HelloWorld = $("button", {
  className: "btn btn-primary",
  textContent, // Reactive binding is handled automatically.
  onclick: () => textContent("Components? We don't need no components."), // Update the reactive value.
});

// Mount directly to the DOM
document.body.append(HelloWorld);
