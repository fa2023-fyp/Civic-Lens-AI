# CivicLens AI progress

## Prompt checklist

- [x] Prompt 0 — Project skeleton and styling foundation
- [x] Prompt 1 — Reusable low-level UI components
- [x] Prompt 2
- [x] Prompt 3
- [x] Prompt 4
- [x] Prompt 5
- [x] Prompt 6
- [x] Prompt 7
- [x] Prompt 8
- [x] Prompt 9
- [x] Prompt 10
- [x] Prompt 11
- [x] Prompt 12
- [x] Prompt 13
- [x] Prompt 14 — Finish authentication (/verify, /forgot-password, /reset-password)
- [x] Prompt 15 — Finish AI components, override controls, extracted entities, pipeline, duplicates, and clusters
- [x] Prompt 16 — Complaint gallery components and /dev/ui integration
- [x] Prompt 22 — Complaint text, lifecycle, SLA, and urgency components
- [x] Prompt 17 — Mock API lifecycle and demo controls complete
- [x] Prompt 18 — Landing page hero and stats shell
- [x] Prompt 19 — Landing sections 3 to 6
- [x] Prompt 20 — Dark intelligence layer section
- [x] Prompt 21 — Landing sections 8 to 12
- [x] Prompt 23 — Officer complaint detail: left and centre zones (text, entities, attachments, AI recommendation cards with confirm/override, low-confidence and location-conflict banners)
- [x] Prompt 24 — Officer workspace right zone (map, SLA + risk, similar/cluster, timeline) with sticky action bar, and /officer/complaints/:id/resolve submission page
- [x] Prompt 25 — Shared review queue at /officer/review-queue and /supervisor/review-queue (flag reason + threshold, queue age with 24h alert, AI-vs-correction side panel, confirm/correct/mark-invalid, demo clock advance)
- [x] Prompt 26 — /officer/clusters list (grid/table toggle, filters, search) and /officer/clusters/:id detail (members, extent mini-map with fallback, timeline, merge/split with reason, per-pair duplicate decisions)
- [x] Prompt 38 — RTL/Urdu and accessibility audit

## Decisions and deviations

- The existing Git repository was retained; Vite is scaffolded at the repository root so `npm run dev` and `npm run build` work directly.
- The already-present backend and earlier frontend folders are preserved but are not imported by or required for this frontend-only scaffold.
- This phase includes only the design foundation and temporary `/dev/tokens` route. Product pages, maps, charts, and real API integration remain future work.
- The API module uses mock mode by default and exposes replaceable endpoints with placeholder payloads matching the planned service boundary.
- React Router 6 is used as requested; `npm audit` currently reports two moderate upstream advisories for that required major version. The prototype uses only fixed internal routes, not attacker-controlled redirect destinations.
- Reusable UI primitives live in per-component folders and use the existing design tokens and English/Urdu dictionaries.
- The development-only `/dev/ui` gallery exercises the component variants; the existing toast UI is reused through a typed `ToastProvider`, and the branded route loader is now `BrandLoader`.

## Known issues

- Urdu translations are draft text and need native-speaker review.
- Google Fonts require network access; system font fallbacks remain configured.
- Mock endpoints return empty or placeholder payloads; they are not a workflow implementation.
- No production API, map, chart, or role-specific pages are included in this prompt phase.
- The UI gallery is intentionally excluded from production routing and remains a developer preview.

## Multipage conversion

- [x] M1 — Shared PageHero and public placeholder route foundation
- [x] M2 — Split landing sections into importable components and reuse them on /features
- [x] M3 — Build public page content (/features and /technology)
- [x] M4 — Add page-specific interactions for About and Contact, including demo form feedback
- [x] M5 — Move public navigation to routes and reorganize landing content across pages
- [x] M6 — Build /how-it-works scroll-linked pipeline and /transparency accountability page
- [x] M7 — Build /help guides, live FAQ search, emergency card, and route/error/offline screens
- [x] M8 — Build bilingual /login and /register forms with demo sign-in
- [x] M9 — Finish authentication (/verify, /forgot-password, /reset-password)
- [x] M10 — Build /citizen home dashboard inside CitizenLayout
- [x] M11 — Build /citizen/submit complaint submission form
- [x] M12 — Install leaflet and build lazy-loaded LocationPicker for /citizen/submit
- [x] M13 — Build /citizen/submit/confirmation/:id confirmation and async analysis page
- [x] M14 — Build /citizen/complaints list and /citizen/complaints/:id detail pages
- [x] M15 — Build /citizen/complaints/:id/verify resolution verification page
- [x] M16 — Build /citizen/notifications and /citizen/profile pages
- [x] M17 — Build /officer assignment workbench inside StaffLayout
