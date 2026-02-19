import { $ } from "../../../element/create-element";
import { $li } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("List Item Element Parity", () => {
  itHasParity("renders with value and type", () => {
    return $("ul", {}, [$li({ value: 5, type: "square" }, ["Item"])]);
  });
});
