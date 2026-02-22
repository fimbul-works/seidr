import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $a } from "./a";

describeDualMode("Anchor Element Parity", () => {
  mockUseScope();

  itHasParity("renders with basic attributes", () => {
    return $a({ href: "https://example.com", target: "_blank", rel: "noopener" }, ["Example"]);
  });

  itHasParity("renders with download attribute (string)", () => {
    return $a({ href: "/file.pdf", download: "filename.pdf" }, ["Download"]);
  });

  itHasParity("renders with download attribute (boolean)", () => {
    // In Seidr, boolean true renders as the attribute name
    return $a({ href: "/file.pdf", download: true as any }, ["Download"]);
  });

  itHasParity("renders with hreflang", () => {
    return $a({ href: "/en", hreflang: "en" }, ["English"]);
  });

  itHasParity("renders with global attributes", () => {
    return $a({ id: "my-link", className: "primary-link" }, ["Styled Link"]);
  });
});
