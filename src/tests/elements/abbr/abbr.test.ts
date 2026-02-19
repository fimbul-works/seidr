import { $abbr } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Abbreviation Element Parity", () => {
  itHasParity("renders with title attribute", () => {
    return $abbr({ title: "HyperText Markup Language" }, ["HTML"]);
  });

  itHasParity("renders with global attributes", () => {
    return $abbr({ id: "markup-abbr", className: "term" }, ["XML"]);
  });
});
