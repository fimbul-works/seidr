import { $ } from "../../../element/create-element";
import { $fieldset } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Fieldset Element Parity", () => {
  itHasParity("renders with legend and disabled", () => {
    return $fieldset({ disabled: true }, [$("legend", {}, ["Legend"]), $("input", { type: "text" })]);
  });
});
