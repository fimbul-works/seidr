import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $u } from "./u";

describeDualMode("Underline Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $u({}, ["Underlined text"]);
  });
});
