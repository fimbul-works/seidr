import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $area } from "./area";

describeDualMode("Area Element Parity", () => {
  mockUseScope();

  itHasParity("renders with href and alt", () => {
    return $area({ href: "/map", alt: "Site Map" });
  });

  itHasParity("renders with coords and shape", () => {
    return $area({ shape: "rect", coords: "0,0,80,100", href: "/rect" });
  });

  itHasParity("renders with download (boolean)", () => {
    return $area({ href: "/image.png", download: true as any });
  });

  itHasParity("renders with referrerpolicy", () => {
    return $area({ href: "/link", referrerPolicy: "no-referrer" });
  });

  itHasParity("renders with rel", () => {
    return $area({ href: "/link", rel: "nofollow" });
  });
});
