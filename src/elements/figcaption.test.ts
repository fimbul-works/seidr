import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $figcaption } from "./figcaption";

describeDualMode("Figcaption Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $figcaption({}, ["Figcaption content"]);
  });
});
