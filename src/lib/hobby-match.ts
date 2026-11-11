// Pure rules for the private photo check: which hobby a photo matches and when to ask for confirmation.
export const HOBBY_KEYS = ["badminton", "chess", "kabaddi"] as const;
export type HobbyKey = (typeof HOBBY_KEYS)[number];
export type HobbyLabel = HobbyKey | "unclear";

/** Below this confidence the model's guess is shown, but must be confirmed before download. */
export const CONFIDENT_MATCH = 0.75;

export const hobbyTitle: Record<HobbyKey, string> = { badminton: "Badminton", chess: "Chess", kabaddi: "Kabaddi" };

export function decideMatch(label: HobbyLabel, confidence: number): { hobby: HobbyKey | null; confidence: number; needsConfirmation: boolean } {
  const c = Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0;
  if (label === "unclear") return { hobby: null, confidence: c, needsConfirmation: true };
  return { hobby: label, confidence: c, needsConfirmation: c < CONFIDENT_MATCH };
}

/** File name the photo is saved under, matching public/images/hobbies/. */
export function downloadName(hobby: HobbyKey) {
  return `${hobby}.jpg`;
}
