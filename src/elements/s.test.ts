import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $s } from "./s";

describeDualMode("Strikethrough Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $s({}, ["Strike"]);
  });
});
