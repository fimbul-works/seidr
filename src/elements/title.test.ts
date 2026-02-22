import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $title } from "./title";

describeDualMode("Title Element Parity", () => {
  mockUseScope();

  itHasParity("renders with content", () => {
    return $title({}, ["Page Title"]);
  });
});
