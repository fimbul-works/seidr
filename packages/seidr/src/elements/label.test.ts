import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $div } from "./div";
import { $input } from "./input";
import { $label } from "./label";

describeDualMode("Label Element Parity", () => {
  itHasParity("renders for input", () => {
    return $div({}, [$label({ htmlFor: "username" }, ["Username:"]), $input({ id: "username" })]);
  });
});
