import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $source } from "./source";

describeDualMode("Source Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $source({ srcset: "img.png", media: "(min-width: 600px)" });
  });
});
