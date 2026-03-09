import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $link } from "./link";

describeDualMode("Link Element Parity", () => {
  mockComponentScope();

  itHasParity("renders for stylesheet with disabled", () => {
    return $link({
      rel: "stylesheet",
      href: "style.css",
      disabled: true,
    });
  });
});
