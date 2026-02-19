import { $ } from "../../../element/create-element";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Parameter Element Parity", () => {
  itHasParity("renders in object", () => {
    return $("object", {}, [$("param", { name: "autoplay", value: "true" })]);
  });
});
