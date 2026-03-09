import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $menu } from "./menu";

describeDualMode("Menu Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with nested items", () => {
    $menu({}, ["Action"]);
  });
});
