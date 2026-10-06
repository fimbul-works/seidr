import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $dfn } from "./dfn";

describeDualMode("Definition Element Parity", () => {
  itHasParity("renders with title", () => {
    return $dfn({ title: "Definition" }, ["Def"]);
  });
});
