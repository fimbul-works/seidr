import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $rt } from "./rt";

describeDualMode("Ruby Text Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $rt({}, ["かん"]);
  });
});
