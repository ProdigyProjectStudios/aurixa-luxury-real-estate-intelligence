import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  /** Legacy: vertical offset for an upward reveal. Overrides `distance` when set. */
  y?: number;
  direction?: Direction;
  distance?: number;
  /** Initial scale (e.g. 0.92) for a subtle zoom-in. */
  scale?: number;
  /**
   * @deprecated No longer applies a filter: blur() — animating `filter` is
   * expensive (main-thread repaint, not GPU-composited) and was a leading
   * cause of scroll jank. Kept as a no-op prop so existing call sites don't
   * need touching.
   */
  blur?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}

/**
 * Premium scroll-reveal wrapper. Fades children into view with optional
 * directional slide, zoom, and focus-pull (blur). Honors prefers-reduced-motion
 * by degrading to a plain fade. Reuse across pages for consistent motion.
 */
export function Reveal({
  children,
  delay = 0,
  y,
  direction = "up",
  distance = 28,
  scale,
  blur,
  duration = 0.8,
  once = true,
  className,
}: RevealProps) {
  void blur;
  const reduce = useReducedMotion();
  const offset = y ?? distance;

  const initial: Record<string, number | string> = { opacity: 0 };
  const animate: Record<string, number | string> = { opacity: 1 };

  if (!reduce) {
    if (direction === "up") initial.y = offset;
    else if (direction === "down") initial.y = -offset;
    else if (direction === "left") initial.x = offset;
    else if (direction === "right") initial.x = -offset;
    animate.x = 0;
    animate.y = 0;
    if (scale !== undefined) {
      initial.scale = scale;
      animate.scale = 1;
    }
  }

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: reduce ? 0.4 : duration, delay: reduce ? 0 : delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  /** Root margin for the in-view trigger. Use a larger negative bottom to delay near-fold reveals. */
  margin?: string;
  /** When provided, the group is controlled: it reveals when `active` is true instead of on scroll-into-view. */
  active?: boolean;
}

/** Container that reveals its `StaggerItem` children one after another. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.12,
  delayChildren = 0,
  once = true,
  margin = "-80px",
  active,
}: StaggerGroupProps) {
  const reduce = useReducedMotion();
  const controlled = active !== undefined;
  return (
    <motion.div
      initial="hidden"
      {...(controlled
        ? { animate: active ? "visible" : "hidden" }
        : { whileInView: "visible", viewport: { once, margin: margin as any } })}
      variants={{
        visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: reduce ? 0 : delayChildren } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const itemVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

/** Child of `StaggerGroup`. Inherits the group's staggered timeline. */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? itemVariantsReduced : itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Pixels the image drifts across the full scroll-through. Higher = stronger. */
  strength?: number;
}

/**
 * Full-bleed background image with a scroll-linked vertical parallax drift.
 * Renders an absolutely-positioned, oversized image so edges never reveal.
 * Disables the drift when the user prefers reduced motion.
 */
export function ParallaxImage({ src, alt, className, strength = 60 }: ParallaxImageProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div ref={ref} className={"absolute inset-0 overflow-hidden " + (className ?? "")}>
      <motion.img
        src={src}
        alt={alt}
        style={reduce ? undefined : { y }}
        className={
          "absolute left-0 w-full object-cover will-change-transform " +
          (reduce ? "inset-0 h-full" : "h-[130%] -top-[15%]")
        }
      />
    </div>
  );
}
