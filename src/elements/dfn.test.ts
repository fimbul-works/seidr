import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $dfn } from "./dfn";

describeDualMode("Definition Element Parity", () => {
  mockUseScope();

  itHasParity("renders with title", () => {
    return $dfn({ title: "Definition" }, ["Def"]);
  });
});
