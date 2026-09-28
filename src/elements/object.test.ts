import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $object } from "./object";

describeDualMode("Object Element Parity", () => {
  itHasParity("renders with data and type", () => {
    return $object({ data: "file.pdf", type: "application/pdf", name: "viewer" });
  });
});
