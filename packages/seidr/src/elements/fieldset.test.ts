import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $fieldset } from "./fieldset";
import { $input } from "./input";
import { $legend } from "./legend";

describeDualMode("Fieldset Element Parity", () => {
  itHasParity("renders with legend and disabled", () => {
    return $fieldset({ disabled: true }, [$legend({}, ["Legend"]), $input({ type: "text" })]);
  });
});
