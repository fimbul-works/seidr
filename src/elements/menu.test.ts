import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $menu } from "./menu";

describeDualMode("Menu Element Parity", () => {
  itHasParity("renders with nested items", () => {
    $menu({}, ["Action"]);
  });
});
