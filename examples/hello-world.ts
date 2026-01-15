import { $, mount, Seidr } from "../src/index.browser.js";

export const HelloWorld = () => {
  return $("div", { textContent: new Seidr("Hello Seidr") });
};

// Mount component only in browser environment (not in tests)
if (typeof window !== "undefined") {
  mount(HelloWorld, document.body);
}
