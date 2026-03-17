import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $s } from "./s";

describeDualMode("Strikethrough Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $s({}, ["Strike"]);
  });
});
