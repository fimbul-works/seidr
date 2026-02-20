import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $link } from "./link";

describeDualMode("Link Element Parity", () => {
  itHasParity("renders for stylesheet with disabled", () => {
    return $link({
      rel: "stylesheet",
      href: "style.css",
      disabled: true,
    });
  });
});
