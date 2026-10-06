import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $p } from "./p";

describeDualMode("Paragraph Element Parity", () => {
  itHasParity("renders with content", () => {
    return $p({ id: "paragraph" }, ["Paragraph content"]);
  });
});
