import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $h5 } from "./h5";

describeDualMode("H5 Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $h5({}, ["Heading 5"]);
  });
});
