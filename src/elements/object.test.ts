import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $object } from "./object";

describeDualMode("Object Element Parity", () => {
  mockUseScope();

  itHasParity("renders with data and type", () => {
    return $object({ data: "file.pdf", type: "application/pdf", name: "viewer" });
  });
});
