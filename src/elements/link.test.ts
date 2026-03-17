import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
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
