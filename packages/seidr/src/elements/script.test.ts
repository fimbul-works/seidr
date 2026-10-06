import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $script } from "./script";

describeDualMode("Script Element Parity", () => {
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
