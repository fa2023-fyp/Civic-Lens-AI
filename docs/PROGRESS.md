# CivicLens AI progress

## Prompt checklist

- [x] Prompt 0 — Project skeleton and styling foundation
- [x] Prompt 1 — Reusable low-level UI components
- [x] Prompt 2
- [x] Prompt 3
- [ ] Prompt 4
- [ ] Prompt 5
- [ ] Prompt 6
- [ ] Prompt 7
- [ ] Prompt 8
- [ ] Prompt 9
- [ ] Prompt 10
- [ ] Prompt 11
- [ ] Prompt 12
- [ ] Prompt 13
- [ ] Prompt 14
- [ ] Prompt 15
- [ ] Prompt 16
- [ ] Prompt 17

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
