import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $p } from "./p";

describeDualMode("Paragraph Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $p({ id: "paragraph" }, ["Paragraph content"]);
  });
});
