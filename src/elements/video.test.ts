import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $video } from "./video";

describeDualMode("Video Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with media attributes", () => {
    return $video({
      src: "movie.mp4",
      poster: "thumb.jpg",
      autoplay: true,
      controls: true,
      loop: true,
      muted: true,
      playsInline: true,
      width: 640,
      height: 360,
    });
  });
});
