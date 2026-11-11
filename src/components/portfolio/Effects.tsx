import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export function Loader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-deep"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.7, 0, 0.3, 1] }}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-5">
            <motion.span className="font-serif text-5xl italic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              SR
            </motion.span>
            <div className="h-px w-24 overflow-hidden bg-border">
              <motion.div className="h-full bg-primary" initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 45 });
  const sy = useSpring(y, { stiffness: 700, damping: 45 });
  const tx = useSpring(x, { stiffness: 180, damping: 24 });
  const ty = useSpring(y, { stiffness: 180, damping: 24 });
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<"idle" | "hover" | "project">("idle");
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      if (el.closest?.("[data-cursor=project]")) setState("project");
      else if (el.closest?.("a,button,input,textarea,[data-cursor=hover]")) setState("hover");
      else setState("idle");
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.body.classList.remove("has-cursor");
    };
  }, [x, y]);
  if (!enabled) return null;
  const ring = state === "project" ? 76 : state === "hover" ? 42 : 26;
  return (
    <>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" style={{ x: sx, y: sy }} />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[90] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/25 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground backdrop-blur-[2px]"
        style={{ x: tx, y: ty }}
        animate={{
          width: ring,
          height: ring,
          backgroundColor: state === "project" ? "color-mix(in oklab, var(--primary) 85%, transparent)" : state === "hover" ? "color-mix(in oklab, var(--foreground) 6%, transparent)" : "transparent",
          borderColor: state === "project" ? "transparent" : "color-mix(in oklab, var(--foreground) 25%, transparent)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {state === "project" ? "View" : ""}
      </motion.div>
    </>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div className="fixed inset-x-0 top-0 z-[80] h-px origin-left bg-primary" style={{ scaleX }} />;
}

export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 16 });
  const y = useSpring(0, { stiffness: 220, damping: 16 });
  return (
    <motion.div
      ref={ref}
      className="inline-block"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself as the section enters — the transition between sections. */
export function Divider() {
  return (
    <motion.div
      aria-hidden
      className="hairline mx-auto max-w-7xl origin-center"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: EASE }}
    />
  );
}

/** Paragraph whose words light up as you scroll through it. Wrap a word in *asterisks* to emphasise it. */
export function TextReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} emphasis={w.startsWith("*")}>
          {w.replace(/\*/g, "")}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range, emphasis }: { children: string; progress: MotionValue<number>; range: [number, number]; emphasis: boolean }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${emphasis ? "font-serif italic text-accent" : ""}`}>
      {children}
    </motion.span>
  );
}

/** Perspective tilt with a soft light that follows the pointer. Mouse only. */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 160, damping: 20 });
  const ry = useSpring(0, { stiffness: 160, damping: 20 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${gx}% ${gy}%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 45%)`;
  return (
    <div style={{ perspective: 1400 }} className="h-full">
      <motion.div
        ref={ref}
        className={`group relative h-full ${className ?? ""}`}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = ref.current!.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          ry.set((px - 0.5) * max * 2);
          rx.set(-(py - 0.5) * max * 2);
          gx.set(px * 100);
          gy.set(py * 100);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        {children}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: glare }} />
      </motion.div>
    </div>
  );
}

/** Renders children only on the client after mount, once near the viewport. */
export function LazyMount({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setOn(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={className}>{on ? children : null}</div>;
}
