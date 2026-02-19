import { $ } from "../../../element/create-element";
import { $details } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Details Element Parity", () => {
  itHasParity("renders with open attribute", () => {
    return $details({ open: true as any }, [$("summary", {}, ["Summary content"]), $("p", {}, ["Detailed content"])]);
  });
});
