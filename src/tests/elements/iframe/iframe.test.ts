import { $iframe } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Iframe Element Parity", () => {
  itHasParity("renders with various attributes", () => {
    return $iframe({
      src: "https://example.com",
      width: "500",
      height: "300",
      allowFullscreen: true,
      loading: "lazy" as any,
      sandbox: "allow-scripts" as any,
    });
  });
});
