import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $menu } from "./menu";

describeDualMode("Menu Element Parity", () => {
  mockUseScope();

  itHasParity("renders with nested items", () => {
    $menu({}, ["Action"]);
  });
});
