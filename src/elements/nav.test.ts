import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $nav } from "./nav";

describeDualMode("Nav Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $nav({ id: "navbar" }, ["Navigation"]);
  });
});
