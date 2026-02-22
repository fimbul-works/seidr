import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $pre } from "./pre";

describeDualMode("Preformatted Text Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $pre({ id: "code-block" }, ["Preformatted text"]);
  });
});
