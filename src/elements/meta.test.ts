import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $meta } from "./meta";

describeDualMode("Meta Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with name and content", () => {
    return $meta({ name: "description", content: "Description" });
  });
});
