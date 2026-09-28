import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $h5 } from "./h5";

describeDualMode("H5 Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $h5({}, ["Heading 5"]);
  });
});
