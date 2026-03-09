import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $dfn } from "./dfn";

describeDualMode("Definition Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with title", () => {
    return $dfn({ title: "Definition" }, ["Def"]);
  });
});
