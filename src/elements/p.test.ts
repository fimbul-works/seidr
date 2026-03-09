import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $p } from "./p";

describeDualMode("Paragraph Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $p({ id: "paragraph" }, ["Paragraph content"]);
  });
});
