import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $td } from "./td";
import { $tfoot } from "./tfoot";
import { $tr } from "./tr";

describeDualMode("Table Footer Element Parity", () => {
  itHasParity("renders with rows", () => {
    return $tfoot({}, [$tr({}, [$td({}, ["Total"])])]);
  });
});
