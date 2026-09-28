import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $meta } from "./meta";

describeDualMode("Meta Element Parity", () => {
  itHasParity("renders with name and content", () => {
    return $meta({ name: "description", content: "Description" });
  });
});
