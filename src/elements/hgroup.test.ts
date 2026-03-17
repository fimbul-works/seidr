import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $h1 } from "./h1";
import { $hgroup } from "./hgroup";
import { $p } from "./p";

describeDualMode("Hgroup Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with children", () => {
    return $hgroup({}, [$h1({}, ["Title"]), $p({}, ["Subtitle"])]);
  });
});
