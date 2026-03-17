import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $nav } from "./nav";

describeDualMode("Nav Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $nav({ id: "navbar" }, ["Navigation"]);
  });
});
