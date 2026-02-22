import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $rp } from "./rp";
import { $rt } from "./rt";
import { $ruby } from "./ruby";

describeDualMode("Ruby Element Parity", () => {
  mockUseScope();

  itHasParity("renders complete structure", () => {
    return $ruby({}, ["漢", $rp({}, ["("]), $rt({}, ["かん"]), $rp({}, [")"])]);
  });
});
