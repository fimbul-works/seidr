import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $track } from "./track";

describeDualMode("Track Element Parity", () => {
  mockComponentScope();

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
