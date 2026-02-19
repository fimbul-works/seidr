import { $ } from "../../../element/create-element";
import { $h1, $hgroup } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Hgroup Element Parity", () => {
  itHasParity("renders with children", () => {
    return $hgroup({}, [$h1({}, ["Title"]), $("p", {}, ["Subtitle"])]);
  });
});
