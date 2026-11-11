import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { MotionConfig, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Boxes, Check, Compass, Copy, Download, GitBranch, Layers, Mail, Menu, Puzzle, Send, Target, X } from "lucide-react";
import { SiBootstrap, SiC, SiCss, SiHtml5, SiJavascript, SiLeetcode, SiMysql, SiPython } from "react-icons/si";
import { Github, Linkedin } from "@/components/portfolio/BrandIcons";
import { profile, skills, projects, education, leetcodeUrl, type Project, type Skill } from "@/lib/portfolio";
import { Certifications, BeyondTheCode, CodingProfiles, Serif, Title } from "@/components/portfolio/Sections";
import { Cursor, Divider, LazyMount, Loader, Magnetic, Reveal, ScrollProgress, TextReveal, Tilt } from "@/components/portfolio/Effects";

const HeroScene = lazy(() => import("@/components/portfolio/Scenes").then((m) => ({ default: m.HeroScene })));

const TITLE = "Subhashan Reddy — Software Engineer & Full Stack Developer";
const DESC = "Portfolio of Subhashan Reddy, Computer Science student at SR University building applications and solving problems with Python, C and data structures.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav = [
  ["About", "about"],
  ["Skills", "stack"],
  ["Work", "work"],
  ["Code", "code"],
  ["Education", "journey"],
  ["Contact", "contact"],
] as const;

const ease = [0.2, 0.7, 0.2, 1] as const;
const D = 0.85; // entrance starts as the loader fades

function Index() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative overflow-x-clip bg-background">
        <Loader />
        <Cursor />
        <ScrollProgress />
        <Header />
        <Hero />
        <About />
        <Divider />
        <Stack />
        <Divider />
        <Work />
        <Divider />
        <CodingProfiles />
        <Divider />
        <Journey />
        <Divider />
        <Certifications />
        <BeyondTheCode />
        <Contact />
      </main>
    </MotionConfig>
  );
}

/* ---------------------------------- Header --------------------------------- */

function Header() {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["top", ...nav.map(([, id]) => id), "certifications", "beyond"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <div className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 md:px-5 ${scrolled ? "glass shadow-card" : "border border-transparent"}`}>
        <a href="#top" className="flex items-center gap-2 text-sm font-medium tracking-tight" aria-label="Back to top">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground font-serif text-base italic text-background">S</span>
          <span className="hidden sm:inline">Subhashan Reddy</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {nav.map(([l, id]) => (
            <a key={id} href={`#${id}`} className={`relative rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${active === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-secondary" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{l}</span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={profile.resume} download className="hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90 sm:inline-flex">
            Résumé <Download className="h-3.5 w-3.5" />
          </a>
          <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-full border md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto mt-2 flex max-w-7xl flex-col rounded-3xl p-2 md:hidden" aria-label="Sections">
          {nav.map(([l, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">{l}</a>
          ))}
          <a href={profile.resume} download className="rounded-2xl px-4 py-3 text-sm text-accent">Download résumé</a>
        </motion.nav>
      )}
    </header>
  );
}

/* ----------------------------------- Hero ---------------------------------- */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 50, damping: 18 });
  const sy = useSpring(py, { stiffness: 50, damping: 18 });
  const cardX = useTransform(sx, (v) => v * 12);
  const cardY = useTransform(sy, (v) => v * 10);
  const rotY = useTransform(sx, (v) => v * 7);
  const rotX = useTransform(sy, (v) => v * -6);
  const textX = useTransform(sx, (v) => v * -6);

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden bg-deep"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        px.set((e.clientX / window.innerWidth) * 2 - 1);
        py.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      <div className="hero-glow absolute inset-0" />
      <div className="dot-grid absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-6 pb-20 pt-28 md:grid-cols-12 md:gap-6 md:px-10 md:pt-24">
        <motion.div style={{ y: textY, x: textX, opacity: fade }} className="order-2 min-w-0 md:order-1 md:col-span-7">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: D, duration: 0.7, ease }} className="inline-flex items-center gap-2.5 rounded-full border bg-secondary/40 py-1.5 pl-2.5 pr-4 text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2"><span className="animate-pulse-dot absolute inset-0 rounded-full bg-success" /></span>
            Available for internships · Hyderabad, India
          </motion.div>

          <h1 className="mt-7 text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.05em]">
            {[
              <span key="a">Subhashan</span>,
              <span key="b" className="pr-2 font-serif font-normal italic tracking-[-0.02em] text-gradient">Reddy.</span>,
            ].map((w, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ delay: D + 0.05 + i * 0.1, duration: 1, ease }}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: D + 0.35, duration: 0.9, ease }}>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Software Engineer · Full Stack Developer · Problem Solver</p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Computer Science student at SR University, passionate about building applications, solving challenging problems and{" "}
              <span className="text-foreground">engineering ideas into reality.</span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href="#work" className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground glow-ring transition-[filter] hover:brightness-110">
                  View my work <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
              <Magnetic>
                <a href={profile.resume} download className="group inline-flex items-center gap-2 rounded-full border bg-secondary/40 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:border-foreground/30 hover:bg-secondary">
                  Download résumé <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
            </div>
            <Socials className="mt-10" />
          </motion.div>
        </motion.div>

        <motion.div style={{ y: imgY }} className="relative order-1 mx-auto w-full max-w-[17rem] sm:max-w-[19rem] md:order-2 md:col-span-5 md:max-w-[22rem]">
          {/* The single 3D element: an orbit that frames the portrait and follows the pointer */}
          <motion.div aria-hidden initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: D + 0.2, duration: 1.6, ease }} className="absolute -inset-x-[55%] -inset-y-[30%]">
            <Suspense fallback={null}>
              <LazyMount className="h-full w-full"><HeroScene /></LazyMount>
            </Suspense>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: D + 0.15, duration: 1.2, ease }} style={{ perspective: 1000 }}>
            <motion.div style={{ x: cardX, y: cardY, rotateY: rotY, rotateX: rotX, transformStyle: "preserve-3d" }} className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border bg-card p-2 shadow-card">
                <div className="relative overflow-hidden rounded-[1.6rem]">
                  <img src="/images/subhashan-portrait.jpg" alt="Portrait of Subhashan Reddy" className="aspect-[4/5] w-full scale-[1.25] object-cover object-[50%_35%]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium">B.Tech CSE</p>
                      <p className="text-xs text-muted-foreground">SR University · 2024–2028</p>
                    </div>
                    <span className="font-serif text-2xl italic text-accent">SR</span>
                  </div>
                </div>
              </div>
              <div className="glass absolute -left-6 top-10 hidden rounded-2xl px-4 py-3 shadow-card sm:block" style={{ transform: "translateZ(50px)" }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Focus</p>
                <p className="mt-0.5 text-sm font-medium">Python · C · DSA</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <a href="#about" className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex" aria-label="Scroll to about">
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-border"><span className="animate-scroll-line absolute inset-x-0 top-0 h-1/2 bg-foreground" /></span>
      </a>
    </section>
  );
}

function Socials({ className = "" }: { className?: string }) {
  const items = [
    { label: "GitHub", href: profile.github, Icon: Github },
    { label: "LinkedIn", href: profile.linkedin, Icon: Linkedin },
    ...(leetcodeUrl ? [{ label: "LeetCode", href: leetcodeUrl, Icon: SiLeetcode }] : []),
    { label: "Email", href: `mailto:${profile.email}`, Icon: Mail },
  ];
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${className}`}>
      {items.map(({ label, href, Icon }) => (
        <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" /> {label}
        </a>
      ))}
    </div>
  );
}

/* ----------------------------------- About ---------------------------------- */

function About() {
  const facts = [
    { v: "2028", l: "Expected graduation" },
    { v: "100%", l: "SSC score" },
    { v: "88.6%", l: "Intermediate (MPC)" },
    { v: "4", l: "Certifications earned" },
  ];
  const principles = [
    { t: "My journey", Icon: Compass, d: "From scoring 100% in SSC to studying Computer Science at SR University — I started with C, discovered data structures, and fell for the craft of building software." },
    { t: "What I'm into", Icon: Layers, d: "Software engineering, full stack development, Python programming, data structures & algorithms, and building practical applications." },
    { t: "How I work", Icon: Target, d: "Understand the problem deeply, choose the simplest efficient solution, and keep learning. Like chess — think a few moves ahead." },
  ];
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
      <Title n="01" label="About">
        A little about <Serif>me</Serif>
      </Title>
      <TextReveal
        className="mt-12 max-w-5xl text-[clamp(1.5rem,3.2vw,2.6rem)] font-medium leading-[1.25] tracking-[-0.025em]"
        text="I'm a Computer Science student at SR University who enjoys turning *ideas* into working software. I started with C, fell for data structures, and now practise problem solving in Python every day — always thinking a few *moves* ahead."
      />

      <div className="mt-20 grid grid-cols-2 border-y md:grid-cols-4">
        {facts.map((f, i) => (
          <Reveal key={f.l} delay={i * 0.06} className={`px-1 py-8 md:px-6 ${i % 2 ? "pl-6" : ""} ${i > 0 ? "md:border-l" : ""} ${i % 2 ? "border-l md:border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""}`}>
            <p className="text-4xl font-medium tracking-[-0.04em] md:text-5xl">{f.v}</p>
            <p className="mt-2 text-sm text-muted-foreground">{f.l}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid gap-12 md:grid-cols-3 md:gap-10">
        {principles.map(({ t, d, Icon }, i) => (
          <Reveal key={t} delay={i * 0.08}>
            <div className="group relative pt-6">
              <span className="absolute inset-x-0 top-0 h-px bg-border" />
              <span className="absolute left-0 top-0 h-px w-0 bg-primary transition-all duration-700 ease-out group-hover:w-full" />
              <Icon className="h-5 w-5 text-accent transition-transform duration-500 group-hover:-translate-y-0.5" strokeWidth={1.5} />
              <h3 className="mt-5 text-xl font-medium tracking-tight">{t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- Skills ---------------------------------- */

type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;
const skillIcon: Record<string, Icon> = {
  Python: SiPython,
  C: SiC,
  MySQL: SiMysql,
  HTML: SiHtml5,
  CSS: SiCss,
  JavaScript: SiJavascript,
  Bootstrap: SiBootstrap,
  "Data Structures": Boxes,
  Algorithms: GitBranch,
  "Problem Solving": Puzzle,
};
const groups: { kind: Skill["kind"]; label: string }[] = [
  { kind: "Language", label: "Languages" },
  { kind: "Web", label: "Web" },
  { kind: "Database", label: "Database" },
  { kind: "Concept", label: "Fundamentals" },
];

function Stack() {
  const [active, setActive] = useState(skills[0]!.name);
  const s = skills.find((k) => k.name === active) ?? skills[0]!;
  const ActiveIcon = skillIcon[s.name] ?? Boxes;
  return (
    <section id="stack" className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
      <Title n="02" label="Skills" aside={<p className="max-w-xs text-sm text-muted-foreground">Hover or tap a skill to see how I use it.</p>}>
        Tools I <Serif>work</Serif> with
      </Title>

      <div className="mt-16 grid gap-12 md:grid-cols-[1.3fr_1fr] md:gap-16">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {groups.map((g, gi) => (
            <Reveal key={g.kind} delay={gi * 0.06}>
              <p className="eyebrow">{g.label}</p>
              <ul className="mt-4">
                {skills.filter((k) => k.kind === g.kind).map((k) => {
                  const I = skillIcon[k.name] ?? Boxes;
                  const on = active === k.name;
                  return (
                    <li key={k.name}>
                      <button
                        onMouseEnter={() => setActive(k.name)}
                        onFocus={() => setActive(k.name)}
                        onClick={() => setActive(k.name)}
                        aria-pressed={on}
                        className={`group flex w-full items-center gap-4 border-b py-3.5 text-left transition-colors ${on ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <I className={`h-[18px] w-[18px] transition-colors duration-300 ${on ? "text-accent" : ""}`} strokeWidth={1.5} />
                        <span className="text-[17px] tracking-tight">{k.name}</span>
                        <ArrowUpRight className={`ml-auto h-4 w-4 transition-all duration-300 ${on ? "translate-x-0 opacity-100 text-accent" : "-translate-x-1 opacity-0"}`} />
                      </button>
                      <motion.p initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} className="overflow-hidden text-sm leading-relaxed text-muted-foreground md:hidden">
                        <span className="block py-3">{k.note}</span>
                      </motion.p>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="hidden md:block">
          <div className="sticky top-32">
            <Tilt max={5} className="overflow-hidden rounded-[2rem] border bg-card shadow-card">
              <div className="soft-glow absolute inset-0" />
              <div className="relative flex min-h-[380px] flex-col p-10">
                <motion.div key={s.name} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.5, ease }} className="flex flex-1 flex-col">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border bg-secondary/60" style={{ transform: "translateZ(30px)" }}>
                    <ActiveIcon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                  </div>
                  <p className="eyebrow mt-auto pt-16">{groups.find((g) => g.kind === s.kind)?.label}</p>
                  <h3 className="mt-3 text-4xl font-medium tracking-[-0.03em]">{s.name}</h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">{s.note}</p>
                </motion.div>
              </div>
            </Tilt>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- Work ----------------------------------- */

function Work() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return (
    <section id="work" className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
      <Title n="03" label="Selected work" aside={<a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">All repositories <ArrowUpRight className="h-4 w-4" /></a>}>
        Things I've <Serif>built</Serif>
      </Title>
      <div className="mt-16 space-y-6">
        {featured.map((p) => <FeaturedProject key={p.title} p={p} />)}
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((p, i) => <ProjectCard key={p.title} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function ProjectLinks({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap gap-2">
      {p.repo && (
        <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90">
          <Github className="h-3.5 w-3.5" /> Repository
        </a>
      )}
      {p.demo && (
        <a href={p.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary">
          Live site <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

function Tags({ tech }: { tech: string[] }) {
  if (!tech.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tech.map((x) => <span key={x} className="rounded-full border bg-secondary/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{x}</span>)}
    </div>
  );
}

function FeaturedProject({ p }: { p: Project }) {
  return (
    <Reveal>
      <Tilt max={3} className="overflow-hidden rounded-[2rem] border bg-card shadow-card">
        <div className="grid md:grid-cols-[1fr_1.25fr]">
          <div className="relative flex flex-col p-8 md:p-12">
            <p className="eyebrow">01 — {p.tagline}</p>
            <h3 className="mt-6 text-5xl font-medium tracking-[-0.045em] md:text-7xl">
              Rapid<span className="font-serif font-normal italic text-gradient">O</span>
            </h3>
            <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">{p.description}</p>
            <div className="mt-6"><Tags tech={p.tech} /></div>
            <div className="mt-10 md:mt-auto md:pt-10"><ProjectLinks p={p} /></div>
          </div>
          <a href={p.repo} target="_blank" rel="noreferrer" data-cursor="project" aria-label={`${p.title} repository on GitHub`} className="relative block min-h-[300px] overflow-hidden border-t md:min-h-[440px] md:border-l md:border-t-0">
            <CoverPreview />
          </a>
        </div>
      </Tilt>
    </Reveal>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const Preview = { cover: CoverPreview, structures: StructuresPreview, code: CodePreview, site: SitePreview }[p.preview];
  return (
    <Reveal delay={i * 0.08} className="h-full">
      <Tilt max={5} className="flex flex-col overflow-hidden rounded-[1.75rem] border bg-card shadow-card transition-colors duration-500 hover:border-foreground/20">
        <div className="relative h-56 overflow-hidden border-b bg-deep" data-cursor={p.demo || p.repo ? "project" : undefined}>
          {p.demo || p.repo ? (
            <a href={p.demo ?? p.repo} target="_blank" rel="noreferrer" aria-label={`Open ${p.title}`} className="absolute inset-0"><Preview /></a>
          ) : (
            <Preview />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="eyebrow">0{i + 2} — {p.tagline}</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em]">{p.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{p.description}</p>
          <div className="mt-5"><Tags tech={p.tech} /></div>
          {(p.repo || p.demo) && <div className="mt-auto pt-6"><ProjectLinks p={p} /></div>}
        </div>
      </Tilt>
    </Reveal>
  );
}

/* Previews — each one says something true about the project. */

function CoverPreview() {
  return (
    <div className="group/p absolute inset-0 bg-deep" style={{ transformStyle: "preserve-3d" }}>
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_60%_40%,var(--primary),transparent_70%)] opacity-35 transition-opacity duration-700 group-hover/p:opacity-55" />
      <div className="dot-grid absolute inset-0 opacity-30" />
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full text-accent transition-transform duration-[1.2s] ease-out group-hover/p:rotate-6 group-hover/p:scale-105" aria-hidden>
        <ellipse cx="200" cy="150" rx="170" ry="60" fill="none" stroke="currentColor" strokeOpacity="0.25" />
        <ellipse cx="200" cy="150" rx="120" ry="40" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        <ellipse cx="200" cy="150" rx="70" ry="22" fill="none" stroke="currentColor" strokeOpacity="0.5" />
        <circle cx="370" cy="150" r="4" fill="currentColor" />
        <circle cx="105" cy="122" r="3" fill="currentColor" fillOpacity="0.7" />
      </svg>
      <div className="absolute inset-0 grid place-items-center" style={{ transform: "translateZ(40px)" }}>
        <span className="font-serif text-[clamp(4rem,10vw,8rem)] italic leading-none text-foreground/90">RapidO</span>
      </div>
      <div className="glass absolute bottom-6 left-6 flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-[11px] text-muted-foreground" style={{ transform: "translateZ(60px)" }}>
        <Github className="h-3.5 w-3.5 text-foreground" /> subhashanreddy25/rapido
      </div>
    </div>
  );
}

function StructuresPreview() {
  const nodes = [12, 7, 31];
  return (
    <motion.div initial="rest" animate="rest" whileHover="hover" className="absolute inset-0 flex flex-col justify-center gap-6 px-6">
      <div className="dot-grid absolute inset-0 opacity-25" />
      <motion.p className="relative font-mono text-[11px] text-muted-foreground" variants={{ rest: { opacity: 0.7 }, hover: { opacity: 1 } }}>
        <span className="text-primary">list</span>.insert_head(<span className="text-accent">5</span>)
      </motion.p>
      <div className="relative flex items-center gap-1.5 overflow-hidden">
        <motion.div className="flex items-center gap-1.5 overflow-hidden" variants={{ rest: { width: 0, opacity: 0 }, hover: { width: "auto", opacity: 1 } }} transition={{ duration: 0.5, ease }}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary bg-primary/20 font-mono text-sm text-foreground">5</span>
          <span className="shrink-0 text-muted-foreground">→</span>
        </motion.div>
        {nodes.map((n) => (
          <span key={n} className="flex shrink-0 items-center gap-1.5">
            <span className="grid h-11 w-11 place-items-center rounded-xl border bg-secondary/60 font-mono text-sm">{n}</span>
            <span className="text-muted-foreground">→</span>
          </span>
        ))}
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">null</span>
      </div>
      <p className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hover to insert · O(1)</p>
    </motion.div>
  );
}

function CodePreview() {
  return (
    <div className="group/p absolute inset-0 p-5 font-mono text-[12px] leading-6">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-3 text-[10px] text-muted-foreground">two_sum.py</span>
      </div>
      <p><span className="text-primary">def</span> <span className="text-accent">two_sum</span>(nums, target):</p>
      <p className="pl-5">seen = {"{}"}</p>
      <p className="pl-5"><span className="text-primary">for</span> i, n <span className="text-primary">in</span> enumerate(nums):</p>
      <p className="pl-10 transition-colors duration-500 group-hover/p:text-accent"><span className="text-primary">if</span> target - n <span className="text-primary">in</span> seen:</p>
      <p className="pl-14 text-muted-foreground"><span className="text-primary">return</span> [seen[target - n], i]<span className="animate-blink ml-0.5 text-accent">▌</span></p>
      <div className="glass absolute bottom-4 right-4 flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] transition-transform duration-500 group-hover/p:-translate-y-1">
        <SiLeetcode className="h-3.5 w-3.5 text-accent" /> Daily practice
      </div>
    </div>
  );
}

function SitePreview() {
  return (
    <div className="group/p absolute inset-0 p-4">
      <div className="h-full overflow-hidden rounded-xl border bg-background">
        <div className="flex items-center gap-1.5 border-b px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-border" /><span className="h-2 w-2 rounded-full bg-border" /><span className="h-2 w-2 rounded-full bg-border" />
          <span className="ml-2 truncate rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[9px] text-muted-foreground">personal-portfolio-mr-reddy25.vercel.app</span>
        </div>
        <div className="space-y-3 p-4 transition-transform duration-[1.6s] ease-out group-hover/p:-translate-y-16">
          <div className="h-3 w-1/3 rounded-full bg-foreground/70" />
          <div className="h-2 w-2/3 rounded-full bg-muted-foreground/30" />
          <div className="h-2 w-1/2 rounded-full bg-muted-foreground/30" />
          <div className="h-6 w-24 rounded-full bg-primary/70" />
          <div className="grid grid-cols-3 gap-2 pt-3">
            {[0, 1, 2, 3, 4, 5].map((k) => <div key={k} className="h-14 rounded-lg bg-secondary" />)}
          </div>
          <div className="h-2 w-3/4 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Education -------------------------------- */

function Journey() {
  return (
    <section id="journey" className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
      <Title n="05" label="Education">
        The <Serif>journey</Serif> so far
      </Title>
      <div className="mt-16 border-t">
        {education.map((e, i) => (
          <Reveal key={e.school} delay={i * 0.08}>
            <div className="group relative grid gap-3 border-b py-8 transition-colors duration-500 md:grid-cols-[180px_1fr_1fr] md:gap-10 md:py-10">
              <span className="absolute left-0 top-0 h-px w-0 bg-primary transition-all duration-700 ease-out group-hover:w-full" />
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-accent">{e.years}</p>
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">{e.school}</h3>
                <p className="mt-1.5 text-muted-foreground">{e.degree} · {e.place}</p>
              </div>
              <p className="text-[15px] leading-relaxed text-muted-foreground md:pt-1">{e.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- Contact --------------------------------- */

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [copied, setCopied] = useState(false);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  const input = "w-full rounded-2xl border bg-secondary/30 px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:bg-secondary/50";
  return (
    <section id="contact" className="relative overflow-hidden bg-deep pt-28 md:pt-40">
      <div className="hero-glow absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal><p className="eyebrow flex items-center gap-3"><span className="text-primary">08</span><span className="h-px w-8 bg-border" />Contact</p></Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-6 max-w-5xl text-[clamp(2.8rem,8vw,7rem)] font-medium leading-[0.95] tracking-[-0.05em]">
            Let's build something <Serif>together.</Serif>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div className="space-y-8">
              <p className="max-w-sm text-muted-foreground">Open to internships and software development opportunities. Based in {profile.location}.</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={`mailto:${profile.email}`} className="break-all text-xl font-medium tracking-tight underline decoration-border underline-offset-8 transition-colors hover:decoration-primary md:text-2xl">{profile.email}</a>
                <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Copy email address">
                  {copied ? <><Check className="h-3.5 w-3.5 text-success" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
              <Socials />
              <Magnetic>
                <a href={profile.resume} download className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                  Download résumé <Download className="h-4 w-4" />
                </a>
              </Magnetic>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <form onSubmit={send} className="glass space-y-3 rounded-[2rem] p-6 shadow-card md:p-8">
              <label className="sr-only" htmlFor="c-name">Your name</label>
              <input id="c-name" required placeholder="Your name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
              <label className="sr-only" htmlFor="c-email">Your email</label>
              <input id="c-email" required type="email" placeholder="Your email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} />
              <label className="sr-only" htmlFor="c-msg">Message</label>
              <textarea id="c-msg" required rows={5} placeholder="Tell me about your idea…" className={input} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} />
              <button type="submit" className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-medium text-primary-foreground glow-ring transition-[filter] hover:brightness-110">
                Send message <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
              <p className="pt-1 text-center text-xs text-muted-foreground">Opens your email app with the message ready to send.</p>
            </form>
          </Reveal>
        </div>
        <footer className="mt-28 flex flex-col justify-between gap-4 border-t py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Subhashan Reddy</span>
          <span className="font-serif text-base italic">Engineering ideas into reality.</span>
        </footer>
      </div>
    </section>
  );
}
