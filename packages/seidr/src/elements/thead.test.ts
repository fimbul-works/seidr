import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $th } from "./th";
import { $thead } from "./thead";
import { $tr } from "./tr";

describeDualMode("Table Header Element Parity", () => {
  itHasParity("renders with rows", () => {
    return $thead({}, [$tr({}, [$th({}, ["Header"])])]);
  });
});
