import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $source } from "./source";

describeDualMode("Source Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $source({ srcset: "img.png", media: "(min-width: 600px)" });
  });
});
