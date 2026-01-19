import { $, mount, Seidr } from "../src/index.browser.js";

export const HelloWorld = () => {
  const textContent = new Seidr("Click me");
  return $("button", { textContent, onclick: () => (textContent.value = "Seidr binds thee") });
};

// Mount component only in browser environment (not in tests)
if (typeof window !== "undefined") {
  mount(HelloWorld, document.body);
}
