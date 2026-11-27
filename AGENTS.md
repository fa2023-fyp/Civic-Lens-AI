# AGENTS.md — CivicLens AI

## Run & navigate after each prompt

After finishing a prompt (and after `npm run build` passes with no errors), run the frontend
and open the page/component you just built. This is a required end-of-prompt step.

1. Start the dev server once, detached, on a fixed port (reuse it on later prompts; only start
   if the port is not already serving). Windows PowerShell:
   ```powershell
   Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev -- --port 5173 --strictPort" -WindowStyle Hidden
   ```
2. Wait for readiness (poll until it returns HTML):
   ```powershell
   $ok=$false; for($i=0;$i -lt 30;$i++){ try { Invoke-WebRequest "http://localhost:5173" -UseBasicParsing | Out-Null; $ok=$true; break } catch { Start-Sleep -Seconds 1 } }
   ```
3. Open the built page in the default browser:
   ```powershell
   Start-Process "http://localhost:5173/<route>"
   ```

If `--strictPort` reports the port busy, read the actual port Vite chose from its output and use
that base URL instead.

### Route selection for `<route>`
- Page prompt → that page's route (e.g. `/officer/clusters`, `/officer/review-queue`,
  `/supervisor/review-queue`, `/officer/complaints/:id`, `/officer/complaints/:id/resolve`).
- Parameterized routes (`:id`) → open the corresponding list/dashboard first
  (e.g. `/officer/dashboard`, `/officer/clusters`) and pick an item, or use a known seed id from
  `src/services/mock/seed.js`.
- Component-only prompt → `/dev/ui`.

### Auth
Most pages are role-guarded. Open the target URL directly; if `RoleGuard` redirects to `/login`,
sign in with the matching demo role button (citizen / officer / supervisor / admin). LoginPage
returns to the original URL after sign-in.

### Reporting
Report the opened URL. Visual confirmation is the user's — the agent cannot see the browser; it
confirms HTTP readiness and that the browser was opened. If the build or server fails, report the
error and do not claim success.
## MINIMALISM RULES
- Read docs/MINIMAL_DESIGN.md once per task.
- Visual refinement only.
- Edit only files named by prompt.
- Never remove trust cues, states, focus styles, RTL or dark mode.
- Run build once and reply in 5 lines.
