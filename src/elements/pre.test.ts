import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $pre } from "./pre";

describeDualMode("Preformatted Text Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $pre({ id: "code-block" }, ["Preformatted text"]);
  });
});
