import { $, mount, Seidr } from "../src/index.browser.js";

export const HelloWorld = () => {
  const textContent = new Seidr("Hello World");
  return $("div", { textContent, onclick: () => (textContent.value = "Hello Seidr") });
};

// Mount component only in browser environment (not in tests)
if (typeof window !== "undefined") {
  mount(HelloWorld, document.body);
}
