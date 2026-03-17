import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $fieldset } from "./fieldset";
import { $input } from "./input";
import { $legend } from "./legend";

describeDualMode("Fieldset Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with legend and disabled", () => {
    return $fieldset({ disabled: true }, [$legend({}, ["Legend"]), $input({ type: "text" })]);
  });
});
