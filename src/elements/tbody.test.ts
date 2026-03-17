import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $tbody } from "./tbody";
import { $td } from "./td";
import { $tr } from "./tr";

describeDualMode("Table Body Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with rows", () => {
    return $tbody({}, [$tr({}, [$td({}, ["Cell"])])]);
  });
});
