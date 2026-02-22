import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $link } from "./link";

describeDualMode("Link Element Parity", () => {
  mockUseScope();

  itHasParity("renders for stylesheet with disabled", () => {
    return $link({
      rel: "stylesheet",
      href: "style.css",
      disabled: true,
    });
  });
});
