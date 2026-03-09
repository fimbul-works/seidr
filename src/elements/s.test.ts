import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $s } from "./s";

describeDualMode("Strikethrough Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $s({}, ["Strike"]);
  });
});
