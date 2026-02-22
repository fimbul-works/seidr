import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $h1 } from "./h1";
import { $hgroup } from "./hgroup";
import { $p } from "./p";

describeDualMode("Hgroup Element Parity", () => {
  mockUseScope();

  itHasParity("renders with children", () => {
    return $hgroup({}, [$h1({}, ["Title"]), $p({}, ["Subtitle"])]);
  });
});
