import { $dfn } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Definition Element Parity", () => {
  itHasParity("renders with title", () => {
    return $dfn({ title: "Definition" }, ["Def"]);
  });
});
