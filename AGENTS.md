<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->
- Portfolio content (profile, skills, projects, education, coding profiles, certificates, hobbies) lives in src/lib/portfolio.ts; the only 3D canvas is the hero orbit in Scenes.tsx, lazy-loaded client-only via LazyMount so SSR never touches WebGL. Later sections (coding profiles, certifications, Beyond the Code) live in src/components/portfolio/Sections.tsx to keep the route file small.
- Site images and downloads are real files under public/ (images/, downloads/) referenced by root-relative paths, never .asset.json pointers — the site is also deployed to Vercel from GitHub, where Lovable's CDN asset URLs don't resolve.
- The private /photo-check page (AI identifies hobby photos) is gated by a server-side passcode env var plus an encrypted session cookie; all checks run in hobby-check.functions.ts/.server.ts, and the matching rules live in src/lib/hobby-match.ts (tested) — keep secrets and AI calls server-side so the tool stays private.
