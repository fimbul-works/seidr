import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $u } from "./u";

describeDualMode("Underline Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $u({}, ["Underlined text"]);
  });
});
