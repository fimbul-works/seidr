import { $ } from "../../../element/create-element";
import { $ol } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Ordered List Element Parity", () => {
  itHasParity("renders with reversed and start", () => {
    return $ol({ reversed: true as any, start: 10 }, [$("li", {}, ["Item 10"]), $("li", {}, ["Item 9"])]);
  });
});
