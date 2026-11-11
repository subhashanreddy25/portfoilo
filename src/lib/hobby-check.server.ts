import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, Output, streamText } from "ai";
import { z } from "zod";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createLovableAiGatewayRunIdFetch } from "./ai/run-id.server";
import { decideMatch, type HobbyKey } from "./hobby-match";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

/* --------------------------------- Passcode -------------------------------- */

type GateSession = { unlocked?: boolean };

// Built per call: env is injected per request on the server runtime.
function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "photo-check",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export function isConfigured() {
  return Boolean(process.env["PHOTO_CHECK_PASSCODE"] && process.env["SESSION_SECRET"] && process.env["LOVABLE_API_KEY"]);
}

export async function isUnlocked() {
  if (!isConfigured()) return false;
  const session = await useSession<GateSession>(sessionConfig());
  return session.data.unlocked === true;
}

function passcodeMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function unlock(passcode: string) {
  const expected = process.env["PHOTO_CHECK_PASSCODE"];
  if (!expected || !isConfigured()) return false;
  if (!passcodeMatches(passcode, expected)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return false;
  }
  const session = await useSession<GateSession>(sessionConfig());
  await session.update({ unlocked: true });
  return true;
}

export async function lock() {
  if (!isConfigured()) return;
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
}

/* ------------------------------ Classification ----------------------------- */

const answerSchema = z.object({
  label: z.enum(["badminton", "chess", "kabaddi", "unclear"]),
  confidence: z.number(),
  reason: z.string(),
});

const INSTRUCTIONS = `You look at one personal photograph and decide which of exactly three activities it shows: badminton, chess or kabaddi.
Evidence to look for:
- badminton: shuttlecock, badminton racket, high net, indoor court lines.
- chess: chessboard, chess pieces, a game in progress.
- kabaddi: mat or mud court, players in raiding or tackling stances, a team contact sport with no ball.
Answer "unclear" when the photo shows none of these, shows more than one, or is too dark, blurry or cropped to tell.
confidence is your certainty from 0 to 1 that the label is correct (use 0 for "unclear").
reason is one short plain-English sentence naming what you saw.`;

export type ClassifyResult =
  | { ok: true; hobby: HobbyKey | null; confidence: number; needsConfirmation: boolean; reason: string }
  | { ok: false; error: string };

function friendlyError(error: unknown): string {
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  if (status === 402) return "Your AI credits have run out. Add credits to your Lovable workspace, then try again.";
  if (status === 429) return "Too many checks in a short time. Wait a minute, then try again.";
  if (status === 403) return "The AI service declined to check this photo. Choose the activity yourself below.";
  if (status === 400) return "This photo couldn't be read. Try a JPG or PNG under 10 MB.";
  return "The photo couldn't be checked right now. Choose the activity yourself, or try again later.";
}

export async function classifyPhoto(imageDataUrl: string, signal?: AbortSignal): Promise<ClassifyResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "The photo check isn't set up on this site." };

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  let streamError: unknown;
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Which activity does this photo show?" },
            { type: "image", image: new URL(imageDataUrl) },
          ],
        },
      ],
      output: Output.object({ schema: answerSchema }),
      maxRetries: 0,
      ...(signal ? { abortSignal: signal } : {}),
      onError: ({ error }) => {
        streamError = error;
      },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const answer = await result.output;
    const decision = decideMatch(answer.label, answer.confidence);
    return { ok: true, ...decision, reason: answer.reason.trim() };
  } catch (error) {
    const cause = streamError ?? error;
    console.error("Photo check failed:", cause);
    return { ok: false, error: friendlyError(cause) };
  }
}
