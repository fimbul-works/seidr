import { $pre } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Preformatted Text Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $pre({ id: "code-block" }, ["Preformatted text"]);
  });
});
