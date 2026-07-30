import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import heroPoster from "@/assets/images/hero-poster.jpg";

/**
 * PremiumVideoHero — a cinematic, full-bleed video background that cross-fades
 * between compressed hero clips like a high-end luxury real-estate film.
 *
 * - Cycles hero-1.mp4 … hero-4.mp4 on a 15.5s interval.
 * - Cross-fade (opacity 0 → 1) over a slow 1.5s blend — never a slide.
 * - Only the active clip plays; the rest stay paused/preloaded for a seamless,
 *   gap-free transition with minimal CPU.
 * - A heavy charcoal gradient sits above the footage so white typography pops.
 *
 * Files live in the artifact's public/ folder and are referenced through
 * import.meta.env.BASE_URL so the SPA works under any mount path.
 */

const HERO_SOURCES = [1, 2, 3, 4].map(
  (n) => `${import.meta.env.BASE_URL}hero-${n}.mp4`,
);

const ROTATE_MS = 15500;
const FADE_SECONDS = 1.5;

export function PremiumVideoHero() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // Respect reduced-motion: pin the first clip, no rotation.
    if (reduce || HERO_SOURCES.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_SOURCES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    const activeVideo = videoRefs.current[active];
    if (activeVideo) {
      activeVideo.currentTime = 0;
      void activeVideo.play().catch(() => {});
    }
    // Keep the outgoing clip playing through the cross-fade so the blend is
    // live footage on both layers, then pause the inactive clips once the
    // fade has completed.
    const fadeMs = (reduce ? 0 : FADE_SECONDS) * 1000;
    const pauseId = window.setTimeout(() => {
      videoRefs.current.forEach((video, i) => {
        if (video && i !== active) video.pause();
      });
    }, fadeMs);
    return () => window.clearTimeout(pauseId);
  }, [active, reduce]);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-[#0B0B0B] bg-cover bg-center"
      style={{ backgroundImage: `url(${heroPoster})` }}
    >
      {HERO_SOURCES.map((src, i) => {
        // Only the active clip and the one coming up next need to be
        // buffered — preloading all four simultaneously competes for
        // bandwidth/decode time and was a source of jank on initial load.
        const isNext = i === (active + 1) % HERO_SOURCES.length;
        const shouldLoad = i === active || isNext;
        return (
          <motion.video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={shouldLoad ? src : undefined}
            poster={heroPoster}
            muted
            playsInline
            loop
            preload={shouldLoad ? "auto" : "none"}
            initial={false}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : FADE_SECONDS, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        );
      })}

      {/* Asymmetrical left-to-right gradient — anchors text in darkness on the
          left while leaving the right side of the footage clear */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-0" />
    </div>
  );
}
