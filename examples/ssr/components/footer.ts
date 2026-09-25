import { createComponent } from "@fimbul-works/seidr";
import { $a, $div, $footer, $img, $span } from "@fimbul-works/seidr/html";

/**
 * Page footer component.
 */
export const Footer = createComponent(
  () =>
    $footer({ className: "site-footer" }, [
      $div(
        { className: "footer-brand" },
        $img({ src: "/seidr-logo-monochrome.svg", alt: "Seidr logo", className: "brand-logo" }),
      ),
      $div({ className: "footer-meta" }, [
        $span({
          textContent: `© ${new Date().getFullYear()} `,
        }),
        $a({ href: "https://github.com/fimbul-works", target: "_blank", rel: "noopener noreferrer" }, "FimbulWorks"),
        $span({ textContent: " • Powered by Seidr SSR & Runtime Graph Hydration" }),
      ]),
    ]),
  "Footer",
);
