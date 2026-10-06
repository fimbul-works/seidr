import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $u } from "./u";

describeDualMode("Underline Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $u({}, ["Underlined text"]);
  });
});
