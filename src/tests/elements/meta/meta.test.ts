import { $meta } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Meta Element Parity", () => {
  itHasParity("renders with name and content", () => {
    return $meta({ name: "description", content: "Description" });
  });
});
