import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $track } from "./track";

describeDualMode("Track Element Parity", () => {
  itHasParity("renders with various attributes", () => {
    return $track({
      kind: "subtitles",
      src: "subs.vtt",
      srclang: "en",
      label: "English",
      default: true,
    });
  });
});
