import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $iframe } from "./iframe";

describeDualMode("Iframe Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with various attributes", () => {
    return $iframe({
      src: "https://example.com",
      width: "500",
      height: "300",
      allowFullscreen: true,
      loading: "lazy",
      sandbox: "allow-scripts" as unknown as DOMTokenList,
    });
  });
});
