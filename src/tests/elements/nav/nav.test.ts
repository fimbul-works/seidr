import { $nav } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Nav Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $nav({ id: "navbar" }, ["Navigation"]);
  });
});
