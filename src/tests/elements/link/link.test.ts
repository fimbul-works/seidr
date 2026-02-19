import { $link } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Link Element Parity", () => {
  itHasParity("renders for stylesheet with disabled", () => {
    return $link({
      rel: "stylesheet",
      href: "style.css",
      disabled: true,
    });
  });
});
