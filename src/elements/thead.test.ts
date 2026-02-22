import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $th } from "./th";
import { $thead } from "./thead";
import { $tr } from "./tr";

describeDualMode("Table Header Element Parity", () => {
  mockUseScope();

  itHasParity("renders with rows", () => {
    return $thead({}, [$tr({}, [$th({}, ["Header"])])]);
  });
});
