import { $ } from "../../../element/create-element";
import { $tr } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Table Row Element Parity", () => {
  itHasParity("renders with cells", () => {
    return $tr({}, [$("td", {}, ["Cell 1"]), $("td", {}, ["Cell 2"])]);
  });
});
