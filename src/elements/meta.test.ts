import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $meta } from "./meta";

describeDualMode("Meta Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with name and content", () => {
    return $meta({ name: "description", content: "Description" });
  });
});
