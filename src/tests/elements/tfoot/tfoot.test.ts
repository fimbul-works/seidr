import { $ } from "../../../element/create-element";
import { $tfoot } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Table Footer Element Parity", () => {
  itHasParity("renders with rows", () => {
    return $tfoot({}, [$("tr", {}, [$("td", {}, ["Total"])])]);
  });
});
