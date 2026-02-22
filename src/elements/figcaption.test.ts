import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $figcaption } from "./figcaption";

describeDualMode("Figcaption Element Parity", () => {
  mockUseScope();

  itHasParity("renders with content", () => {
    return $figcaption({}, ["Figcaption content"]);
  });
});
