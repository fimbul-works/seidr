import { $ } from "../../../element/create-element";
import { $ul } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Unordered List Element Parity", () => {
  itHasParity("renders with children", () => {
    return $ul({}, [$("li", {}, ["Item 1"]), $("li", {}, ["Item 2"])]);
  });
});
