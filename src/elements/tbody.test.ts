import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $tbody } from "./tbody";
import { $td } from "./td";
import { $tr } from "./tr";

describeDualMode("Table Body Element Parity", () => {
  mockUseScope();

  itHasParity("renders with rows", () => {
    return $tbody({}, [$tr({}, [$td({}, ["Cell"])])]);
  });
});
