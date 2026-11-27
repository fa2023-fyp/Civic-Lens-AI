# Plan: Run the frontend and navigate to the built page after each prompt

## Goal
Establish a repeatable end-of-prompt step so that, after implementing a prompt, the
implementation agent runs the Vite frontend and opens the specific page/component it just
built (handling role auth via the demo login). Persist this rule so future sessions obey it.

## Decisions (confirmed with user)
- Auth when navigating: open the target URL directly; if `RoleGuard` redirects to `/login`,
  the user signs in with the matching demo role button (LoginPage returns to the original
  URL via `location.state.from`). No new auth code.
- Persist the rule in `AGENTS.md` (project instructions) so it applies to future prompts.
- This is a process change only; no app source/behavior changes.

## Context (verified)
- Dev server: `npm run dev` → Vite with `--host 0.0.0.0`; default `http://localhost:5173`
  (`package.json`, `vite.config.js`).
- Auth: session in `localStorage['civiclens-session']` = `{ token, user{id,role}, expiresAt }`.
  `RoleGuard` → `/login` when unauthenticated, `/403` for wrong role
  (`src/components/guards/RoleGuard.jsx`).
- Demo accounts exist per role via `api.demoUsers`; the LoginPage renders a demo button per
  role and, after login, returns to `state.from`.
- A component-only prompt is previewed in the dev gallery at `/dev/ui`.

## Tasks (for an implementation-capable agent)
1. Create `AGENTS.md` at repo root (it does not exist yet) with a concise
   "Run & navigate after each prompt" section containing the SOP below. Keep it short;
   do not add unrelated documentation.
2. After finishing each future prompt (and after `npm run build` passes), execute the SOP:
   - Start the dev server once, detached, on a fixed port (Windows PowerShell):
     ```powershell
     Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev -- --port 5173 --strictPort" -WindowStyle Hidden
     ```
     Reuse the already-running server on later prompts; only start if the port is not serving.
   - Wait for readiness (poll until it returns HTML):
     ```powershell
     $ok=$false; for($i=0;$i -lt 30;$i++){ try { Invoke-WebRequest "http://localhost:5173" -UseBasicParsing | Out-Null; $ok=$true; break } catch { Start-Sleep -Seconds 1 } }
     ```
   - Open the built page in the default browser:
     ```powershell
     Start-Process "http://localhost:5173/<route>"
     ```
   - If `--strictPort` reports the port busy, read the actual port Vite chose from its output
     and use that base URL instead.
3. Route selection for `<route>`:
   - Page prompt → that page's route (e.g. `/officer/clusters`, `/officer/review-queue`,
     `/supervisor/review-queue`, `/officer/complaints/:id`, `/officer/complaints/:id/resolve`).
   - Parameterized routes (`:id`): open the corresponding list/dashboard first
     (e.g. `/officer/dashboard`, `/officer/clusters`) and pick an item, or use a known seed id
     from `src/services/mock/seed.js`.
   - Component-only prompt → `/dev/ui`.
   - Role hint: citizen pages need the citizen demo role, officer/supervisor pages the matching
     staff role; if the browser lands on `/login`, sign in with that role's demo button.
4. Report the opened URL and note that visual confirmation is the user's (the agent cannot see
   the browser). If the server or build fails, report the error and do not claim success.

## AGENTS.md content (short)
A "Run & navigate after each prompt" heading with: run `npm run build` (fix errors), then start
the detached dev server on port 5173 (reuse if running), open the built route in the browser,
and use the matching demo role at `/login` if redirected. Include the three PowerShell snippets
above and the route-selection rules.

## Risks / notes
- Background dev server must be detached; a blocking `npm run dev` call will hang the tool.
- Port 5173 may be occupied; handle via `--strictPort` fallback to the reported port.
- The agent cannot visually verify rendering; it confirms HTTP readiness and that the browser
  was opened. Auth-gated pages require the human to complete demo login.
- `AGENTS.md` is documentation, but it is explicitly requested by the user (overrides the
  "no extra docs" default).

## Validation
- `AGENTS.md` exists and contains the run-and-navigate SOP.
- Running the SOP opens `http://localhost:5173/<built-route>` and the server returns HTML.
- For a role-guarded route, `/login` appears first and the matching demo role returns to the route.

## Open questions
- None material. (If a future prompt builds only a subcomponent with no gallery entry, default
  to `/dev/ui`.)