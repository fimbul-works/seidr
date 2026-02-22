import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $script } from "./script";

describeDualMode("Script Element Parity", () => {
  mockUseScope();

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
