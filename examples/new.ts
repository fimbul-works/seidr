import { $, Seidr, watchMutations } from "@fimbul-works/seidr";

const textContent = new Seidr("Click me");

export const HelloWorld = $("button", {
  className: "btn",
  textContent, // Reactive value binding
  onclick: () => (textContent.value = "Seidr binds thee"),
});

watchMutations(document.body);
document.body.append(HelloWorld);
