import { $script } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

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
