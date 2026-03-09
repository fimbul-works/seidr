import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $object } from "./object";

describeDualMode("Object Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with data and type", () => {
    return $object({ data: "file.pdf", type: "application/pdf", name: "viewer" });
  });
});
