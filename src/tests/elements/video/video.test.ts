import { $video } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Video Element Parity", () => {
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
