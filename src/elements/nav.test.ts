import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $nav } from "./nav";

describeDualMode("Nav Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $nav({ id: "navbar" }, ["Navigation"]);
  });
});
