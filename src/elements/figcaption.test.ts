import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $figcaption } from "./figcaption";

describeDualMode("Figcaption Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $figcaption({}, ["Figcaption content"]);
  });
});
