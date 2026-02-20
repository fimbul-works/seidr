import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $base } from "./base";

describeDualMode("Document Base URL Element Parity", () => {
  itHasParity("renders with href", () => {
    return $base({ href: "https://example.com/" });
  });

  itHasParity("renders with target", () => {
    return $base({ target: "_blank" });
  });

  itHasParity("renders with both href and target", () => {
    return $base({ href: "https://example.com/", target: "_top" });
  });
});
