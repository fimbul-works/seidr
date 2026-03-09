import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $title } from "./title";

describeDualMode("Title Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $title({}, ["Page Title"]);
  });
});
