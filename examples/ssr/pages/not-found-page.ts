import { createComponent, Link } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";

/**
 * 404 Not Found page component.
 */
export const NotFoundPage = createComponent(
  () => $div({ className: "error not-found-page" }, [$div({}, "Page not found"), Link({ to: "/" }, "← Back to home")]),
  "NotFoundPage",
);
