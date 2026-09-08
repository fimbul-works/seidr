import { $, createValue } from "../src/index";

const textContent = createValue("Click me");

export const HelloWorld = $("button", {
  className: "btn",
  textContent, // Reactive value binding
  onclick: () => textContent("Seidr binds thee"),
});

document.body.append(HelloWorld);
