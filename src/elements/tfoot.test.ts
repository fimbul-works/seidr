import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $td } from "./td";
import { $tfoot } from "./tfoot";
import { $tr } from "./tr";

describeDualMode("Table Footer Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with rows", () => {
    return $tfoot({}, [$tr({}, [$td({}, ["Total"])])]);
  });
});
