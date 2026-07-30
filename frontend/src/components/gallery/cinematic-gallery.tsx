import { useEffect, useLayoutEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Sparkles,
  Play,
  Pause,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

// These clips are served from the app's public/ directory (bundled with the repo).
const vid2 = "/hero-2.mp4";
const vid4 = "/hero-4.mp4";

import poster2 from "@/assets/posters/vid2.jpg";
import poster4 from "@/assets/posters/vid4.jpg";
import poster3 from "@/assets/posters/vid3.jpg";
import poster5 from "@/assets/posters/vid5.jpg";
import posterSkyline from "@/assets/posters/skyline.jpg";

interface Slide {
  id: string;
  src: string;
  poster: string;
  title: string;
  featured?: boolean;
}

// These clips stream from ImageKit instead of bundled files.
const vid5 = "https://ik.imagekit.io/l1kwycxrs/vid61440p-00.00.00.000-00.01.20.618.mp4";
const vid3 = "https://ik.imagekit.io/l1kwycxrs/vid7.mp4";
const skylineSrc =
  "https://ik.imagekit.io/l1kwycxrs/Cinematic%20Luxury%20Real%20Estate%20Tour%20%EF%BD%9C%20Rancho%20Santa%20Fe%20%EF%BD%9C%20Sony%20FX3%20+%20DJI%20Air3S-00.00.00.000-00.00.55.768.webm/ik-video.mp4?updatedAt=1780971703784";

// Centerpiece (vid5) sits in the middle so it is the default active slide.
const slides: Slide[] = [
  { id: "vid1", src: vid2, poster: poster2, title: "Amanhecer Litorâneo" },
  { id: "vid2", src: skylineSrc, poster: posterSkyline, title: "Skyline Privativo" },
  { id: "vid5", src: vid5, poster: poster5, title: "A Obra-Prima", featured: true },
  { id: "vid3", src: vid3, poster: poster3, title: "Refúgio nas Alturas" },
  { id: "vid4", src: vid4, poster: poster4, title: "Horizonte Infinito" },
];

const CENTER_INDEX = 2;
const CENTER_WIDTH_RATIO = 0.7;
const GAP = 24;

export function CinematicGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // One <video> element per in-range slide, keyed by slide id, so the active
  // clip and its neighbors stay mounted + buffered across navigation.
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  // Live mirror of `inView` so async handlers (e.g. leaving PiP) can read the
  // CURRENT visibility instead of a value captured when PiP was opened.
  const inViewRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(CENTER_INDEX);
  const [isMuted, setIsMuted] = useState(true);
  // Last non-zero volume, restored when toggling sound back on (0–1).
  const [volume, setVolume] = useState(1);
  // "Enhance" applies a richer contrast/saturation grade to the active clip.
  const [enhanced, setEnhanced] = useState(false);
  // Slide id currently popped out into Picture-in-Picture (null when none). Kept
  // in React state so the playback effect re-evaluates the auto-pause policy the
  // moment PiP opens or closes — including when closed from the PiP window.
  const [pipId, setPipId] = useState<string | null>(null);
  // Slide id that must NOT auto-resume after leaving PiP. Closing PiP (via the
  // window's "back to tab"/close button, or while scrolled away) should fully
  // stop the clip rather than keep it playing in the background; this blocks the
  // autoplay path until the user re-engages (scrolls away & back, or navigates).
  const [blockedResumeId, setBlockedResumeId] = useState<string | null>(null);
  // Whether the active clip is currently playing — drives the center button icon.
  const [isPlaying, setIsPlaying] = useState(false);
  // The user manually paused the active clip via the center button; autoplay must
  // not override that intent until they hit play again or switch slides.
  const [userPaused, setUserPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inView, setInView] = useState(false);
  const [armed, setArmed] = useState(false);
  // Slide ids whose <video> has enough data to paint a frame, so we can reveal
  // it the instant it becomes active instead of showing the poster first.
  const [readyIds, setReadyIds] = useState<Set<string>>(new Set());
  const [cw, setCw] = useState(0);

  // On phones the 0.7 ratio leaves the hero clip tiny; widen it to near-full so
  // the cinematic stage reads as premium on small screens.
  const centerRatio = cw > 0 && cw < 640 ? 0.94 : CENTER_WIDTH_RATIO;
  const centerW = cw > 0 ? cw * centerRatio : 0;
  const viewportH = centerW * (9 / 16);
  const active = slides[activeIndex];
  // Every slide ships a bundled, non-black poster, so this never returns "" —
  // a real frame always paints immediately, even before the clip streams in.
  const posterFor = (s: Slide) => s.poster;

  // Measure the carousel width so slide offsets can be computed in px.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCw(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setCw(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Gate playback on the gallery being on screen (never loads/plays on page load).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        inViewRef.current = visible;
        setInView(visible);
      },
      { threshold: [0, 0.35, 1] },
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // Arm the source only after the gallery is first seen, so no <video> request
  // (least of all the 105MB centerpiece) is ever made on page load.
  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  // Switching slides is an explicit interaction — drop any post-PiP autoplay
  // block and manual-pause intent so the newly chosen clip is free to play.
  useEffect(() => {
    setBlockedResumeId(null);
    setUserPaused(false);
  }, [activeIndex]);

  // Leaving the page (route change) while a clip is in PiP must close it, or it
  // would keep playing detached with sound and clash with a freshly-mounted
  // gallery on return.
  useEffect(() => {
    const videos = videoRefs.current;
    return () => {
      const pip = document.pictureInPictureElement;
      // Only close PiP if it belongs to one of this gallery's clips — never an
      // unrelated video elsewhere on the page.
      if (pip && [...videos.values()].includes(pip as HTMLVideoElement)) {
        document.exitPictureInPicture().catch(() => {});
      }
    };
  }, []);

  // Only the active video plays (with sound if unmuted); the buffered neighbors
  // stay paused and silent so they are ready to show the instant they're chosen.
  // React's `muted` prop is unreliable, so the DOM property is set directly.
  useEffect(() => {
    videoRefs.current.forEach((v, id) => {
      const isActive = slides[activeIndex].id === id;
      const isPip = pipId === id;
      // A clip in Picture-in-Picture has its audio governed by the native PiP
      // window's own sound control — don't force mute/volume from the carousel
      // state, so the user can toggle PiP sound on even when the main video is
      // muted. Exiting PiP re-applies the carousel's mute state below.
      if (!isPip) {
        v.muted = isActive ? isMuted : true;
        if (isActive) v.volume = volume;
      }
      const isBlocked = blockedResumeId === id;
      if (isActive && inView && armed && !isBlocked && !userPaused)
        v.play().catch(() => {});
      // A clip in Picture-in-Picture keeps playing even when the carousel scrolls
      // out of view; the normal in-view auto-pause is otherwise untouched. A clip
      // just closed out of PiP (isBlocked) or manually paused (userPaused) is
      // paused and stays stopped instead of resuming in the background.
      else if (!isPip) v.pause();
    });
  }, [activeIndex, inView, armed, isMuted, volume, pipId, blockedResumeId, userPaused]);

  // Lock body scroll + allow ESC to exit theater mode.
  useEffect(() => {
    if (!isExpanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isExpanded]);

  const go = (dir: number) =>
    setActiveIndex((i) => Math.min(slides.length - 1, Math.max(0, i + dir)));

  // Touch swipe navigation (mobile only — touch events never fire for the
  // desktop mouse, so desktop arrow/click logic is untouched).
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Horizontal swipe only; ignore vertical scrolls and incidental taps.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  // Center play/pause control. Pausing records manual intent so autoplay won't
  // fight it; playing also clears any post-PiP block so it's a definitive resume.
  const togglePlay = () => {
    const id = slides[activeIndex].id;
    const video = videoRefs.current.get(id);
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      setBlockedResumeId((cur) => (cur === id ? null : cur));
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  // PiP is suppressed on the <video> (disablePictureInPicture) so the browser
  // never injects its own overlay button onto the card. Our control re-enables
  // it just long enough to open PiP, then re-suppresses it on exit — so only the
  // right-side button can trigger it, and it always targets the active clip.
  const togglePiP = async () => {
    const id = slides[activeIndex].id;
    const video = videoRefs.current.get(id);
    if (!video) return;
    // Fires whether PiP is closed via our button, the PiP window's own controls,
    // or navigation: re-suppress the native overlay and clear the tracked id so
    // the playback effect re-applies the in-view auto-pause.
    const onLeave = () => {
      video.disablePictureInPicture = true;
      // On the carousel (in view): let the clip resume from where it left off.
      // Off-screen: fully stop it and block autoplay so it never keeps playing in
      // the background, until the user re-engages (navigates / remounts).
      if (!inViewRef.current) {
        video.pause();
        setBlockedResumeId(id);
      }
      setPipId((cur) => (cur === id ? null : cur));
    };
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        video.disablePictureInPicture = false;
        video.addEventListener("leavepictureinpicture", onLeave, { once: true });
        await video.requestPictureInPicture();
        setPipId(id);
      }
    } catch {
      // Request failed: undo the temporary enable and drop the pending listener
      // so repeated failed clicks can't accumulate stale handlers.
      video.removeEventListener("leavepictureinpicture", onLeave);
      video.disablePictureInPicture = true;
    }
  };

  const setVideoRef = (id: string) => (el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  };

  // Readiness must be per element-instance, not historical: when a slide leaves
  // the ±1 window its <video> unmounts, so drop its readiness here. If it later
  // re-enters and remounts, the poster then stays visible until the FRESH
  // element decodes a frame — so a revisited card can never flash black.
  // (Done in an effect, NOT the ref callback: inline ref callbacks fire with
  // null on every re-render, which would wipe readiness constantly and keep all
  // videos hidden behind their posters.)
  useEffect(() => {
    setReadyIds((prev) => {
      if (prev.size === 0) return prev;
      let changed = false;
      const next = new Set(prev);
      prev.forEach((id) => {
        const idx = slides.findIndex((s) => s.id === id);
        if (idx === -1 || Math.abs(idx - activeIndex) > 1) {
          next.delete(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [activeIndex]);

  const markReady = (id: string) =>
    setReadyIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const centerLeft = cw > 0 ? cw / 2 - centerW / 2 : 0;

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-32 bg-[#0B0B0B] overflow-x-clip">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <Reveal direction="left" distance={40} className="will-change-transform [backface-visibility:hidden] [transform:translateZ(0)]">
          <div className="max-w-2xl mb-14 lg:mb-16">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-4">
              Em Movimento
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-tight mb-6">
              Galeria <span className="text-[#C2A063] italic">Cinematográfica</span>
            </h2>
            <p className="text-[#9A938A] leading-relaxed">
              Uma sala de cinema particular. Navegue pela coleção em movimento e expanda
              qualquer cena para o modo teatro.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Carousel stage */}
      <div className="relative mx-auto w-full max-w-[1600px] px-4">
        <div
          ref={viewportRef}
          className="relative w-full touch-pan-y"
          style={{ height: viewportH || undefined }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Poster slides (edges show static frames, paused) */}
          {slides.map((slide, i) => {
            const offset = i - activeIndex;
            const visible = Math.abs(offset) <= 1;
            const isActive = offset === 0;
            return (
              <motion.button
                key={slide.id}
                type="button"
                onClick={() => !isActive && setActiveIndex(i)}
                aria-label={isActive ? slide.title : `Ver ${slide.title}`}
                animate={{
                  x: cw > 0 ? centerLeft + offset * (centerW + GAP) : 0,
                  scale: isActive ? 1 : 0.88,
                  opacity: visible ? (isActive ? 1 : 0.45) : 0,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                style={{ width: centerW || undefined, height: "100%", left: 0, top: 0 }}
                className={
                  "absolute overflow-hidden rounded-xl bg-black " +
                  (isActive
                    ? "z-10 cursor-default ring-1 ring-[#C2A063]/40"
                    : "z-0 cursor-pointer ring-1 ring-white/5") +
                  (visible ? "" : " pointer-events-none")
                }
              >
                {posterFor(slide) ? (
                  <img
                    src={posterFor(slide)}
                    alt={slide.title}
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </motion.button>
            );
          })}

          {/* Navigation arrows (outside the center card, over the bleed) */}
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={activeIndex === 0}
            aria-label="Cena anterior"
            className="absolute left-2 lg:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/15 hidden md:flex items-center justify-center text-white transition-all hover:bg-[#C2A063] hover:text-black hover:border-[#C2A063] disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={activeIndex === slides.length - 1}
            aria-label="Próxima cena"
            className="absolute right-2 lg:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/15 hidden md:flex items-center justify-center text-white transition-all hover:bg-[#C2A063] hover:text-black hover:border-[#C2A063] disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Single persistent video: pinned to center, expands into theater mode */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            style={
              isExpanded
                ? undefined
                : { width: centerW || undefined, height: viewportH || undefined, left: centerLeft, top: 0 }
            }
            className={
              "group/card " +
              (isExpanded
                ? "fixed inset-4 lg:inset-8 z-[60] rounded-xl overflow-hidden bg-black shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
                : "absolute z-20 rounded-xl overflow-hidden bg-black ring-1 ring-[#C2A063]/40")
            }
          >
            {/* Poster is only a behind-the-video fallback for a clip that
                hasn't buffered yet; it sits below the <video> (z-0), ignores
                pointer events, and fades out the instant the active clip is
                ready so it can never cover a playing video. */}
            {posterFor(active) ? (
              <img
                src={posterFor(active)}
                alt=""
                aria-hidden
                style={{
                  opacity: readyIds.has(active.id) ? 0 : 1,
                  transition: "opacity 150ms ease",
                }}
                className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
              />
            ) : null}
            {/* The active clip + its immediate neighbors each keep their own
                buffered <video>, so navigating shows the new clip instantly
                instead of waiting on a fresh load behind the poster. */}
            {armed &&
              slides.map((slide, i) => {
                if (Math.abs(i - activeIndex) > 1) return null;
                const isActive = i === activeIndex;
                const show = isActive && readyIds.has(slide.id);
                return (
                  <video
                    key={slide.id}
                    ref={setVideoRef(slide.id)}
                    src={slide.src}
                    preload="auto"
                    loop
                    playsInline
                    muted
                    disablePictureInPicture
                    onLoadedData={() => markReady(slide.id)}
                    onCanPlay={() => markReady(slide.id)}
                    onPlaying={() => markReady(slide.id)}
                    onPlay={() => {
                      if (isActive) setIsPlaying(true);
                    }}
                    onPause={() => {
                      if (isActive) setIsPlaying(false);
                    }}
                    style={{
                      opacity: show ? 1 : 0,
                      // Fade the active clip in once it's ready; everything else
                      // (old active, preloading neighbors) hides instantly.
                      transition: show
                        ? "opacity 300ms ease, filter 400ms ease"
                        : "filter 400ms ease",
                      // Perceived-quality grade applied only to the active clip.
                      filter:
                        isActive && enhanced
                          ? "contrast(1.12) saturate(1.14) brightness(1.04)"
                          : undefined,
                    }}
                    className="absolute inset-0 z-10 w-full h-full object-cover"
                  />
                );
              })}

            {/* Center play/pause — premium control, revealed only on card hover. */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              className="absolute bottom-4 left-1/2 z-20 hidden md:flex h-11 w-11 -translate-x-1/2 translate-y-1 scale-90 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 ease-out pointer-events-none hover:border-[#C2A063] hover:bg-[#C2A063] hover:text-black group-hover/card:translate-y-0 group-hover/card:scale-100 group-hover/card:opacity-100 group-hover/card:pointer-events-auto"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 translate-x-0.5" />
              )}
            </button>

            {/* Custom control overlay (above the video) */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMuted((m) => {
                      // Unmuting while the slider sits at 0 would stay silent —
                      // restore an audible level so icon and sound stay in sync.
                      if (m && volume === 0) setVolume(0.6);
                      return !m;
                    });
                  }}
                  aria-label={isMuted ? "Ativar som" : "Silenciar"}
                  aria-pressed={!isMuted}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-colors hover:bg-[#C2A063] hover:text-black hover:border-[#C2A063]"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                {/* Vertical volume overlay — appears on hover, no gap so the
                    pointer can travel from the button into the slider. */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 -translate-y-0.5 pointer-events-none transition-[opacity,transform] duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                  <div className="flex flex-col items-center rounded-full bg-black/55 backdrop-blur-md border border-white/15 px-2.5 py-2.5 shadow-lg shadow-black/30">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        setIsMuted(v === 0);
                      }}
                      aria-label="Volume"
                      className="h-16 w-1 cursor-pointer accent-[#C2A063]"
                      style={{ writingMode: "vertical-lr", direction: "rtl" }}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnhanced((e) => !e)}
                aria-label={enhanced ? "Desativar realce" : "Realçar qualidade"}
                aria-pressed={enhanced}
                className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-colors hover:bg-[#C2A063] hover:text-black hover:border-[#C2A063] ${
                  enhanced
                    ? "bg-[#C2A063] text-black border-[#C2A063]"
                    : "bg-black/40 text-white border-white/15"
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={togglePiP}
                aria-label="Picture-in-Picture"
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 hidden md:flex items-center justify-center text-white transition-colors hover:bg-[#C2A063] hover:text-black hover:border-[#C2A063]"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((e) => !e)}
                aria-label={isExpanded ? "Sair do modo teatro" : "Modo teatro"}
                aria-pressed={isExpanded}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-colors hover:bg-[#C2A063] hover:text-black hover:border-[#C2A063]"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="absolute bottom-4 left-5 z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <div className="text-[10px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-1">
                {active.featured ? "Destaque" : "Em Movimento"}
              </div>
              <h3 className="font-serif text-xl lg:text-2xl leading-tight text-white">{active.title}</h3>
            </div>
          </motion.div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center gap-2 mt-10">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ir para ${slide.title}`}
              aria-current={i === activeIndex}
              className={
                "h-1.5 rounded-full transition-all duration-300 " +
                (i === activeIndex ? "w-8 bg-[#C2A063]" : "w-2 bg-white/25 hover:bg-white/50")
              }
            />
          ))}
        </div>
      </div>

      {/* Theater-mode backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-[55] bg-black/90 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </section>
  );
}
