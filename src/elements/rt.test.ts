import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $rt } from "./rt";

describeDualMode("Ruby Text Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $rt({}, ["かん"]);
  });
});
