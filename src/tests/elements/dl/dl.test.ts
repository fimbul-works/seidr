import { $ } from "../../../element/create-element";
import { $dl, $dt } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Description List Element Parity", () => {
  itHasParity("renders complete structure", () => {
    return $dl({}, [$dt({}, ["Term"]), $("dd", {}, ["Definition"])]);
  });
});
