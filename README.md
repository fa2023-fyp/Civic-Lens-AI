# CivicLens AI — frontend foundation

CivicLens AI is an **AI intelligence and accountability layer** over existing civic complaint workflows, not another complaint website or a replacement for existing services. The experience is designed around:

`Understand → Extract → Classify → Prioritise → Route → Detect related issues → Monitor SLA → Escalate → Verify resolution → Audit AI decisions`

This phase is frontend-only. React 18, Vite, React Router 6, plain JavaScript/JSX, CSS custom-property design tokens, and a replaceable mock-service boundary live at the repository root. No backend service is required.

## Run locally

```powershell
npm install
npm run dev
```

Open the displayed local URL. `/` redirects to the temporary token preview at `/dev/tokens`. The development-only component gallery is at `/dev/ui`.

```powershell
npm run lint
npm run build
npm run preview
```

`VITE_USE_MOCK=true` is the default from `.env.example`. `VITE_API_BASE_URL` is intentionally blank until a real API is introduced. No user or complaint data is loaded by the current mock service.

## Foundation in this phase

- Emerald, ink, neutral, AI, urgency, and status design tokens with light/dark semantic overrides.
- Responsive spacing, typography, radius, shadow, layering, focus, and motion tokens.
- Logical-property utilities and RTL-aware directional animations.
- English/Urdu starter dictionaries, persisted language choice, RTL document direction, and a native-speaker review note.
- No-flash system-aware theme initialization with a persistent theme toggle.
- Accessible landmarks, skip link, focus ring, reduced-motion handling, live toast region, and lazy token-preview route.
- Mock service boundary, project-context documentation, prompt checklist, and requested source-folder skeleton.
- Reusable, token-based low-level UI components with keyboard interactions and a bilingual development gallery at `/dev/ui`.

## Prototype guardrails

The persistent notice reads “Academic prototype — not an official government portal.” AI is described as recommending rather than deciding. Demo-looking numbers carry a “Demo data” label. Do not treat the sample content as research results, operational data, or a government integration.

## Existing repository contents

An earlier repository version includes backend and AI-service folders. They are preserved but are not dependencies of this root frontend, are not used by its Vite routes, and are outside the scope of this frontend-only phase.

See [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md), [docs/PROGRESS.md](docs/PROGRESS.md), [docs/ROUTES.md](docs/ROUTES.md), and [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md).
