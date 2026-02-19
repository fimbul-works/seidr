import { $ } from "../../../element/create-element";
import { $tbody } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Table Body Element Parity", () => {
  itHasParity("renders with rows", () => {
    return $tbody({}, [$("tr", {}, [$("td", {}, ["Cell"])])]);
  });
});
