import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $menu } from "./menu";

describeDualMode("Menu Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with nested items", () => {
    $menu({}, ["Action"]);
  });
});
