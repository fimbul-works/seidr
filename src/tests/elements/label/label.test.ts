import { $ } from "../../../element/create-element";
import { $label } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Label Element Parity", () => {
  itHasParity("renders for input", () => {
    return $("div", {}, [$label({ htmlFor: "username" }, ["Username:"]), $("input", { id: "username" })]);
  });
});
