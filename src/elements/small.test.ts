import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $small } from "./small";

describeDualMode("Small Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $small({}, ["Small text"]);
  });
});
