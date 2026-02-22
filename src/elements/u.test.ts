import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $u } from "./u";

describeDualMode("Underline Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $u({}, ["Underlined text"]);
  });
});
