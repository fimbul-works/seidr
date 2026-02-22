import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $abbr } from "./abbr";

describeDualMode("Abbreviation Element Parity", () => {
  mockUseScope();

  itHasParity("renders with title attribute", () => {
    return $abbr({ title: "HyperText Markup Language" }, ["HTML"]);
  });

  itHasParity("renders with global attributes", () => {
    return $abbr({ id: "markup-abbr", className: "term" }, ["XML"]);
  });
});
