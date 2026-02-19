import { $ } from "../../../element/create-element";
import { $table } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Table Element Parity", () => {
  itHasParity("renders with nested structure", () => {
    return $table({ border: "1" as any }, [
      $("caption", {}, ["Table Caption"]),
      $("thead", {}, [$("tr", {}, [$("th", {}, ["Header 1"]), $("th", {}, ["Header 2"])])]),
      $("tbody", {}, [$("tr", {}, [$("td", {}, ["Cell 1"]), $("td", {}, ["Cell 2"])])]),
    ]);
  });
});
