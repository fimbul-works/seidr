import { createComponent } from "@fimbul-works/seidr";
import { $footer } from "@fimbul-works/seidr/html";

/**
 * Page footer component.
 */
export const Footer = createComponent(
  () => $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`),
  "Footer",
);
