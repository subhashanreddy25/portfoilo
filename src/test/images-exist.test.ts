import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Every /images/... or /downloads/... path used in the site must be a real committed file in public/,
// so it ships with any host (Vercel included), not only inside Lovable.
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(tsx?|css)$/.test(f) ? [p] : [];
  });
}

const referenced = new Set<string>();
for (const f of sourceFiles("src")) {
  if (f.includes("/test/")) continue;
  for (const m of readFileSync(f, "utf8").matchAll(/["'`](\/(?:images|downloads)\/[^"'`]+)["'`]/g)) {
    const path = m[1];
    if (path) referenced.add(path);
  }
}

describe("site images", () => {
  it("references the portrait, the 4 certificates and the résumé", () => {
    expect(referenced).toContain("/images/subhashan-portrait.jpg");
    for (const c of ["python", "mysql", "aptitude", "dsa-python"]) expect(referenced).toContain(`/images/certificates/${c}.png`);
    expect(referenced).toContain("/downloads/Subhashan-Reddy-Resume.pdf");
    for (const h of ["badminton", "chess", "kabaddi"]) expect(referenced).toContain(`/images/hobbies/${h}.jpg`);
  });

  it.each([...referenced])("%s exists in public/", (path) => {
    expect(existsSync(join("public", path))).toBe(true);
  });

  it("uses no Lovable-only asset pointers", () => {
    for (const f of sourceFiles("src")) {
      if (f.includes("/test/")) continue;
      expect(readFileSync(f, "utf8")).not.toMatch(/\.asset\.json|__l5e/);
    }
  });
});
