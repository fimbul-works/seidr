import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $p } from "./p";

describeDualMode("Paragraph Element Parity", () => {
  mockUseScope();

  itHasParity("renders with content", () => {
    return $p({ id: "paragraph" }, ["Paragraph content"]);
  });
});
