import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $pre } from "./pre";

describeDualMode("Preformatted Text Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $pre({ id: "code-block" }, ["Preformatted text"]);
  });
});
