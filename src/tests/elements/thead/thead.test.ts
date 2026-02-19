import { $ } from "../../../element/create-element";
import { $thead } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Table Header Element Parity", () => {
  itHasParity("renders with rows", () => {
    return $thead({}, [$("tr", {}, [$("th", {}, ["Header"])])]);
  });
});
