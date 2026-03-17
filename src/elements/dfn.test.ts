import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $dfn } from "./dfn";

describeDualMode("Definition Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with title", () => {
    return $dfn({ title: "Definition" }, ["Def"]);
  });
});
