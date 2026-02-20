import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $s } from "./s";

describeDualMode("Strikethrough Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $s({}, ["Strike"]);
  });
});
