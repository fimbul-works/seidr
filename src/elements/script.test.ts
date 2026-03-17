import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $script } from "./script";

describeDualMode("Script Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with various attributes", () => {
    return $script({
      src: "app.js",
      type: "module",
      async: true,
      defer: true,
      noModule: true,
      crossOrigin: "anonymous",
    });
  });
});
