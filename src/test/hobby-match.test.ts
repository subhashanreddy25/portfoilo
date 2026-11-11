import { describe, expect, it } from "vitest";
import { decideMatch, downloadName } from "@/lib/hobby-match";

describe("photo check matching", () => {
  it("a confident match needs no confirmation", () => {
    expect(decideMatch("chess", 0.9)).toEqual({ hobby: "chess", confidence: 0.9, needsConfirmation: false });
  });

  it("a low-confidence match is flagged for confirmation", () => {
    expect(decideMatch("kabaddi", 0.6)).toEqual({ hobby: "kabaddi", confidence: 0.6, needsConfirmation: true });
  });

  it("an unclear photo has no suggested hobby and needs confirmation", () => {
    expect(decideMatch("unclear", 0.4)).toEqual({ hobby: null, confidence: 0.4, needsConfirmation: true });
  });

  it("names the downloaded file after the hobby, as a .jpg", () => {
    expect(downloadName("badminton")).toBe("badminton.jpg");
    expect(downloadName("chess")).toBe("chess.jpg");
    expect(downloadName("kabaddi")).toBe("kabaddi.jpg");
  });
});
