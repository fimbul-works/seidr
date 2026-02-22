import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $div } from "./div";
import { $input } from "./input";
import { $label } from "./label";

describeDualMode("Label Element Parity", () => {
  mockUseScope();

  itHasParity("renders for input", () => {
    return $div({}, [$label({ htmlFor: "username" }, ["Username:"]), $input({ id: "username" })]);
  });
});
