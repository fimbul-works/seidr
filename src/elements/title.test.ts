import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $title } from "./title";

describeDualMode("Title Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $title({}, ["Page Title"]);
  });
});
