import { useCallback, useEffect, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { SiHackerrank, SiLeetcode } from "react-icons/si";
import { Reveal } from "@/components/portfolio/Effects";
import { certificateIssuer, certificates, codingProfiles, hobbies, type CodingProfile, type Hobby } from "@/lib/portfolio";

const ease = [0.2, 0.7, 0.2, 1] as const;

/* ------------------------------- Section title ------------------------------ */

export function Title({ n, label, children, aside, tone = "default" }: { n: string; label: string; children: ReactNode; aside?: ReactNode; tone?: "default" | "warm" }) {
  const warm = tone === "warm";
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <Reveal>
          <p className={`eyebrow flex items-center gap-3 ${warm ? "text-ivory-muted" : ""}`}>
            <span className={warm ? "text-amber" : "text-primary"}>{n}</span>
            <span className={`h-px w-8 ${warm ? "bg-warm-border" : "bg-border"}`} />
            {label}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.04em]">{children}</h2>
        </Reveal>
      </div>
      {aside && <Reveal delay={0.12}>{aside}</Reveal>}
    </div>
  );
}

export function Serif({ children }: { children: ReactNode }) {
  return <em className="pr-1 font-serif font-normal italic tracking-[-0.01em] text-gradient">{children}</em>;
}

/* ------------------------------ Coding profiles ----------------------------- */

/** Codeforces' three-bar mark in its own colours. */
function CodeforcesLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1.5" y="9" width="5.4" height="12" rx="1.2" className="fill-brand-codeforces-yellow" />
      <rect x="9.3" y="3" width="5.4" height="18" rx="1.2" className="fill-brand-codeforces" />
      <rect x="17.1" y="7" width="5.4" height="14" rx="1.2" className="fill-brand-codeforces-red" />
    </svg>
  );
}

const platformLogo: Record<CodingProfile["platform"], { Icon: (p: { className?: string }) => ReactNode; color: string }> = {
  LeetCode: { Icon: SiLeetcode, color: "text-brand-leetcode" },
  Codeforces: { Icon: CodeforcesLogo, color: "" },
  HackerRank: { Icon: SiHackerrank, color: "text-brand-hackerrank" },
};

export function CodingProfiles() {
  return (
    <section id="code" className="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <Title n="04" label="Practice">
        Coding <Serif>profiles</Serif>
      </Title>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {codingProfiles.map((p, i) => {
          const { Icon, color } = platformLogo[p.platform];
          return (
            <Reveal key={p.platform} delay={i * 0.07}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${p.platform} profile @${p.username} (opens in a new tab)`}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-card"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-secondary/60 transition-transform duration-500 group-hover:scale-105">
                  <Icon className={`h-6 w-6 ${color}`} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[17px] font-medium tracking-tight">{p.platform}</span>
                  <span className="block truncate font-mono text-xs text-muted-foreground">@{p.username}</span>
                </span>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------- Certifications ----------------------------- */

const certImage: Record<(typeof certificates)[number]["key"], string> = {
  python: "/images/certificates/python.png",
  mysql: "/images/certificates/mysql.png",
  aptitude: "/images/certificates/aptitude.png",
  "dsa-python": "/images/certificates/dsa-python.png",
};

export function Certifications() {
  const [open, setOpen] = useState<number | null>(null);
  const go = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + certificates.length) % certificates.length)), []);
  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, go]);
  const c = open !== null ? certificates[open] : null;

  return (
    <section id="certifications" className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
      <Title n="06" label="Certifications" aside={<p className="max-w-xs text-sm text-muted-foreground">Issued by {certificateIssuer}. Click any certificate to view it in full.</p>}>
        Certified <Serif>learning</Serif>
      </Title>

      <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2">
        {certificates.map((cert, i) => (
          <Reveal key={cert.key} delay={(i % 2) * 0.08}>
            <button onClick={() => setOpen(i)} data-cursor="project" className="group block w-full text-left" aria-label={`View ${cert.module} certificate`}>
              <div className="relative overflow-hidden rounded-[1.5rem] border bg-card p-2.5 shadow-card transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-foreground/20">
                <div className="relative overflow-hidden rounded-[1.1rem]">
                  <img src={certImage[cert.key]} alt={`${cert.module} certificate of module completion from ${certificateIssuer}`} loading="lazy" className="aspect-[2000/1414] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="glass absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs opacity-0 transition-all duration-500 group-hover:opacity-100">
                    <Expand className="h-3.5 w-3.5" /> View
                  </span>
                </div>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4 px-1">
                <div>
                  <h3 className="text-2xl font-medium tracking-[-0.03em]">{cert.module}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cert.course}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{cert.issued}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">{certificateIssuer}</p>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      <DialogPrimitive.Root open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-deep/90 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content className="fixed inset-0 z-[61] flex flex-col items-center justify-center p-4 outline-none md:p-10" aria-describedby={undefined}>
            {c && open !== null && (
              <>
                <DialogPrimitive.Title className="sr-only">{c.module} certificate</DialogPrimitive.Title>
                <motion.img
                  key={c.key}
                  src={certImage[c.key]}
                  alt={`${c.module} certificate of module completion from ${certificateIssuer}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease }}
                  className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain shadow-card"
                />
                <div className="mt-5 flex w-full max-w-4xl items-center justify-between gap-4">
                  <button onClick={() => go(-1)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-secondary/60 transition-colors hover:bg-secondary" aria-label="Previous certificate">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 text-center">
                    <p className="text-lg font-medium tracking-tight">{c.module} · <span className="text-muted-foreground">{c.course}</span></p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{certificateIssuer} · {c.issued} · {open + 1}/{certificates.length}</p>
                  </div>
                  <button onClick={() => go(1)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-secondary/60 transition-colors hover:bg-secondary" aria-label="Next certificate">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <DialogPrimitive.Close className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border bg-secondary/60 transition-colors hover:bg-secondary md:right-8 md:top-8" aria-label="Close">
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}

/* ------------------------------ Beyond the Code ----------------------------- */

function HobbyMedia({ h, n, className }: { h: Hobby; n: number; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border border-warm-border ${className}`}>
      {h.image ? (
        <img src={h.image} alt={`${h.name} being played`} loading="lazy" style={h.position ? { objectPosition: h.position } : undefined} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]" />
      ) : (
        <div className="warm-grain absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]" aria-hidden>
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-amber">
            <circle cx="300" cy="80" r="140" fill="none" stroke="currentColor" strokeOpacity="0.12" />
            <circle cx="300" cy="80" r="90" fill="none" stroke="currentColor" strokeOpacity="0.16" />
            <circle cx="300" cy="80" r="40" fill="none" stroke="currentColor" strokeOpacity="0.2" />
          </svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
      <span className="absolute right-5 top-4 font-serif text-5xl italic text-ivory/25 md:text-6xl">0{n}</span>
    </div>
  );
}

export function BeyondTheCode() {
  const [badminton, chess, kabaddi] = hobbies as [Hobby, Hobby, Hobby];
  return (
    <section id="beyond" className="relative overflow-hidden bg-charcoal text-ivory">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-ivory-muted">
                <span className="text-amber">07</span>
                <span className="h-px w-8 bg-warm-border" />
                The human side
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 font-serif text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em]">Beyond the Code</h2>
              <p className="mt-3 font-serif text-xl italic text-amber md:text-2xl">Different passions. One curious mind.</p>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="max-w-xs text-sm leading-relaxed text-ivory-muted">Outside software development, I enjoy activities that challenge my focus, strategy, discipline, and teamwork.</p>
          </Reveal>
        </div>

        {/* Badminton — wide feature */}
        <Reveal className="mt-16">
          <article className="group relative">
            <HobbyMedia h={badminton} n={1} className="aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9]" />
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-warm-border bg-charcoal/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" /> {badminton.kicker}
            </span>
            <div className="absolute inset-x-0 bottom-0 grid gap-4 p-6 md:grid-cols-[1fr_minmax(0,22rem)] md:items-end md:p-10">
              <div>
                <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">01 <span className="h-px w-8 bg-amber/50 transition-all duration-700 group-hover:w-16" /> {badminton.theme}</p>
                <h3 className="mt-3 font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.9]">{badminton.name}</h3>
              </div>
              <p className="text-sm leading-relaxed text-ivory/80">{badminton.description}</p>
            </div>
          </article>
        </Reveal>

        {/* Chess + Kabaddi — staggered editorial pair */}
        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-8">
          {[
            { h: chess, n: 2, col: "md:col-span-5", media: "aspect-[4/5]", offset: "" },
            { h: kabaddi, n: 3, col: "md:col-span-7", media: "aspect-[4/3]", offset: "md:mt-28" },
          ].map(({ h, n, col, media, offset }, i) => (
            <Reveal key={h.name} delay={i * 0.1} className={`${col} ${offset}`}>
              <article className="group">
                <div className="relative">
                  <HobbyMedia h={h} n={n} className={media} />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">0{n} <span className="h-px w-8 bg-amber/50 transition-all duration-700 group-hover:w-16" /> {h.theme}</p>
                    <h3 className="mt-2 font-serif text-[clamp(2.6rem,5vw,4rem)] leading-[0.95]">{h.name}</h3>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 border-t border-warm-border pt-5 sm:grid-cols-[9rem_1fr]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-muted">{h.kicker}</p>
                  <p className="text-sm leading-relaxed text-ivory/80">{h.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-deep" />
    </section>
  );
}
