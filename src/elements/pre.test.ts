import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $pre } from "./pre";

describeDualMode("Preformatted Text Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $pre({ id: "code-block" }, ["Preformatted text"]);
  });
});
