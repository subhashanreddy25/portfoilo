import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, Check, Download, ImageUp, Loader2, Lock, RotateCcw } from "lucide-react";
import { classifyHobbyPhoto, getPhotoCheckStatus, lockPhotoCheck, unlockPhotoCheck } from "@/lib/hobby-check.functions";
import { HOBBY_KEYS, downloadName, hobbyTitle, type HobbyKey } from "@/lib/hobby-match";
import { cn } from "@/lib/utils";

const statusQuery = queryOptions({ queryKey: ["photo-check-status"], queryFn: () => getPhotoCheckStatus() });

export const Route = createFileRoute("/photo-check")({
  head: () => ({
    meta: [
      { title: "Photo check · Subhashan Reddy" },
      { name: "description", content: "Private tool for sorting hobby photographs for the portfolio." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Photo check · Subhashan Reddy" },
      { property: "og:description", content: "Private tool for sorting hobby photographs for the portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statusQuery),
  component: PhotoCheckPage,
});

function PhotoCheckPage() {
  const { data } = useSuspenseQuery(statusQuery);
  return (
    <main className="warm-grain min-h-screen text-ivory">
      <div className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-20">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-muted transition-colors hover:text-ivory">
            <ArrowLeft className="h-3.5 w-3.5" /> Portfolio
          </Link>
          {data.unlocked && <LockButton />}
        </header>

        <div className="mt-12">
          <p className="eyebrow flex items-center gap-3 text-ivory-muted">
            <span className="text-amber">Private</span>
            <span className="h-px w-8 bg-warm-border" />
            Beyond the Code
          </p>
          <h1 className="mt-5 font-serif text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.95] tracking-[-0.02em]">Photo check</h1>
          <p className="mt-3 max-w-lg font-serif text-xl italic text-amber">Badminton, chess or kabaddi — sorted before it goes on the site.</p>
        </div>

        <div className="mt-12">
          {!data.configured ? <NotSetUp /> : data.unlocked ? <Checker /> : <PasscodeForm />}
        </div>
      </div>
    </main>
  );
}

function NotSetUp() {
  return (
    <div className="rounded-2xl border border-warm-border bg-charcoal/70 p-8 text-sm leading-relaxed text-ivory-muted">
      The photo check isn't switched on for this copy of the site.
    </div>
  );
}

function LockButton() {
  const lockFn = useServerFn(lockPhotoCheck);
  const qc = useQueryClient();
  return (
    <button
      type="button"
      onClick={async () => {
        await lockFn();
        await qc.invalidateQueries({ queryKey: statusQuery.queryKey });
      }}
      className="inline-flex items-center gap-2 rounded-full border border-warm-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-muted transition-colors hover:border-amber/60 hover:text-ivory"
    >
      <Lock className="h-3.5 w-3.5" /> Lock
    </button>
  );
}

function PasscodeForm() {
  const unlockFn = useServerFn(unlockPhotoCheck);
  const qc = useQueryClient();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const passcode = String(new FormData(e.currentTarget).get("passcode") ?? "");
    if (!passcode) return;
    setBusy(true);
    setError(false);
    try {
      const { ok } = await unlockFn({ data: { passcode } });
      if (ok) await qc.invalidateQueries({ queryKey: statusQuery.queryKey });
      else setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form method="post" onSubmit={onSubmit} className="max-w-md rounded-2xl border border-warm-border bg-charcoal/70 p-8 backdrop-blur">
      <label htmlFor="passcode" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-muted">Passcode</label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        autoComplete="current-password"
        autoFocus
        className="mt-3 w-full rounded-xl border border-warm-border bg-charcoal px-4 py-3 text-ivory outline-none transition-colors placeholder:text-ivory-muted/50 focus:border-amber"
      />
      {error && <p role="alert" className="mt-3 text-sm text-amber">That passcode isn't right.</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-medium text-charcoal transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Unlock
      </button>
    </form>
  );
}

/* --------------------------------- Checker --------------------------------- */

type Result =
  | { kind: "match"; suggested: HobbyKey | null; confidence: number; needsConfirmation: boolean; reason: string }
  | { kind: "error"; message: string };

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 20 * 1024 * 1024;

async function loadImage(file: Blob) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawToJpeg(img: HTMLImageElement, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // flatten transparent PNGs; canvas pixels, not page styling
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", quality));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function Checker() {
  const classify = useServerFn(classifyHobbyPhoto);
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [jpeg, setJpeg] = useState<Blob | null>(null);
  const [analysisUrl, setAnalysisUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [chosen, setChosen] = useState<HobbyKey | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const reset = useCallback(() => {
    setPreview(null);
    setJpeg(null);
    setAnalysisUrl(null);
    setResult(null);
    setChosen(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    reset();
    if (!ACCEPTED.includes(file.type)) return setFileError("Please choose a JPG, PNG or WebP photo.");
    if (file.size > MAX_BYTES) return setFileError("That photo is over 20 MB. Please choose a smaller one.");
    try {
      const img = await loadImage(file);
      setPreview(URL.createObjectURL(file));
      // Keep the original bytes when it's already a JPG; otherwise convert at full size.
      setJpeg(file.type === "image/jpeg" ? file : await canvasBlob(drawToJpeg(img, Number.MAX_SAFE_INTEGER), 0.95));
      setAnalysisUrl(drawToJpeg(img, 1600).toDataURL("image/jpeg", 0.85));
    } catch {
      setFileError("That photo couldn't be opened. Try another file.");
    }
  }

  async function runCheck() {
    if (!analysisUrl) return;
    setChecking(true);
    setResult(null);
    setChosen(null);
    try {
      const res = await classify({ data: { imageDataUrl: analysisUrl } });
      if (res.ok) {
        setResult({ kind: "match", suggested: res.hobby, confidence: res.confidence, needsConfirmation: res.needsConfirmation, reason: res.reason });
        if (!res.needsConfirmation) setChosen(res.hobby);
      } else {
        setResult({ kind: "error", message: res.error });
        if (res.error.includes("passcode")) await qc.invalidateQueries({ queryKey: statusQuery.queryKey });
      }
    } catch {
      setResult({ kind: "error", message: "The photo couldn't be checked right now. Choose the activity yourself, or try again later." });
    } finally {
      setChecking(false);
    }
  }

  if (!preview) {
    return (
      <div>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); void onFile(e.dataTransfer.files[0]); }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-warm-border bg-charcoal/60 px-6 py-20 text-center transition-colors hover:border-amber/60",
            dragging && "border-amber bg-charcoal-raised",
          )}
        >
          <ImageUp className="h-8 w-8 text-amber" />
          <span className="font-serif text-3xl">Choose a hobby photo</span>
          <span className="text-sm text-ivory-muted">Drop it here or click to browse · JPG, PNG or WebP</span>
          <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="sr-only" aria-label="Hobby photo" onChange={(e) => void onFile(e.target.files?.[0])} />
        </label>
        {fileError && <p role="alert" className="mt-4 text-sm text-amber">{fileError}</p>}
      </div>
    );
  }

  const confirmed = chosen !== null;
  const match = result?.kind === "match" ? result : null;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <figure className="relative self-start overflow-hidden rounded-2xl border border-warm-border bg-charcoal">
        <img src={preview} alt="Photo being checked" className="aspect-[4/5] w-full object-cover md:aspect-[4/3]" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
        {confirmed && (
          <figcaption className="absolute bottom-5 left-6 font-serif text-5xl leading-none">{hobbyTitle[chosen]}</figcaption>
        )}
      </figure>

      <div className="flex flex-col gap-6">
        {!result && (
          <button
            type="button"
            onClick={runCheck}
            disabled={checking || !analysisUrl}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber px-6 py-3.5 text-sm font-medium text-charcoal transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {checking ? <><Loader2 className="h-4 w-4 animate-spin" /> Looking at the photo…</> : "Identify activity"}
          </button>
        )}

        {match && !match.needsConfirmation && match.suggested && (
          <div className="rounded-2xl border border-warm-border bg-charcoal/70 p-6">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-amber"><Check className="h-3.5 w-3.5" /> Match · {Math.round(match.confidence * 100)}%</p>
            <p className="mt-3 font-serif text-4xl">{hobbyTitle[match.suggested]}</p>
            <p className="mt-3 text-sm leading-relaxed text-ivory-muted">{match.reason}</p>
          </div>
        )}

        {match?.needsConfirmation && (
          <div role="status" className="rounded-2xl border border-amber/50 bg-charcoal/70 p-6">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-amber">
              <AlertTriangle className="h-3.5 w-3.5" /> Please confirm
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ivory">
              {match.suggested
                ? `This might be ${hobbyTitle[match.suggested]}, but I'm not sure (${Math.round(match.confidence * 100)}%).`
                : "I couldn't tell which activity this photo shows."}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{match.reason}</p>
          </div>
        )}

        {result?.kind === "error" && (
          <div role="alert" className="rounded-2xl border border-amber/50 bg-charcoal/70 p-6 text-sm leading-relaxed text-ivory">{result.message}</div>
        )}

        {result && (match?.needsConfirmation || result.kind === "error" || confirmed) && (
          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-muted">{confirmed && !match?.needsConfirmation && result.kind !== "error" ? "Not right? Change it" : "Which activity is it?"}</legend>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {HOBBY_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={chosen === k}
                  onClick={() => setChosen(k)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    chosen === k ? "border-amber bg-amber text-charcoal" : "border-warm-border text-ivory hover:border-amber/60",
                    match?.suggested === k && chosen !== k && "border-amber/60",
                  )}
                >
                  {hobbyTitle[k]}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {result && (
          <button
            type="button"
            disabled={!confirmed || !jpeg}
            onClick={() => chosen && jpeg && downloadBlob(jpeg, downloadName(chosen))}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ivory px-6 py-3.5 text-sm font-medium text-charcoal transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" /> {confirmed ? `Download ${downloadName(chosen)}` : "Confirm the activity to download"}
          </button>
        )}

        <button type="button" onClick={reset} className="inline-flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-muted transition-colors hover:text-ivory">
          <RotateCcw className="h-3.5 w-3.5" /> Check another photo
        </button>
      </div>
    </div>
  );
}
