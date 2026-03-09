import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $small } from "./small";

describeDualMode("Small Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $small({}, ["Small text"]);
  });
});
