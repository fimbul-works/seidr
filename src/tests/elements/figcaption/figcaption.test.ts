import { $figcaption } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Figcaption Element Parity", () => {
  itHasParity("renders with content", () => {
    return $figcaption({}, ["Figcaption content"]);
  });
});
