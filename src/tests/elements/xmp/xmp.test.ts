import { $ } from "../../../element/create-element";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("XMP Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $("xmp", {}, ["Preformatted block"]);
  });
});
// Fixed factory call for xmp since it might not be in the $specialized elements
