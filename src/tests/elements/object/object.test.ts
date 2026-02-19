import { $object } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Object Element Parity", () => {
  itHasParity("renders with data and type", () => {
    return $object({ data: "file.pdf", type: "application/pdf", name: "viewer" });
  });
});
