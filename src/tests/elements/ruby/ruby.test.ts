import { $rp, $rt, $ruby } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Ruby Element Parity", () => {
  itHasParity("renders complete structure", () => {
    return $ruby({}, ["漢", $rp({}, ["("]), $rt({}, ["かん"]), $rp({}, [")"])]);
  });
});
