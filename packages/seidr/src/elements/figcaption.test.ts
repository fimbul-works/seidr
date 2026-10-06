import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $figcaption } from "./figcaption";

describeDualMode("Figcaption Element Parity", () => {
  itHasParity("renders with content", () => {
    return $figcaption({}, ["Figcaption content"]);
  });
});
