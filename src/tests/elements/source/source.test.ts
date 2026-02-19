import { $source } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Source Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $source({ srcset: "img.png", media: "(min-width: 600px)" });
  });
});
