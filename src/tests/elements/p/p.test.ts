import { $p } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Paragraph Element Parity", () => {
  itHasParity("renders with content", () => {
    return $p({ id: "paragraph" }, ["Paragraph content"]);
  });
});
