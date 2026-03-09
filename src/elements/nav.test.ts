import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $nav } from "./nav";

describeDualMode("Nav Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $nav({ id: "navbar" }, ["Navigation"]);
  });
});
