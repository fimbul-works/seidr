import { createComponent } from "@fimbul-works/seidr";
import { $div, $i, $span } from "@fimbul-works/seidr/html";

/**
 * Loading spinner component.
 */
export const LoadingSpinner = createComponent(() => {
  return $div(
    { className: "loading-spinner-wrapper" },
    $div({ className: "loading-spinner", role: "status", ariaLabel: "Loading", title: "Loading..." }, $span($i())),
  );
}, "LoadingSpinner");
