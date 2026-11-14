PROJECT
CivicLens AI (full title: “AI-Powered Multilingual Civic Complaint Intelligence and Resolution System”) is a Final Year Project at Lahore Garrison University, Lahore, Pakistan. You are building ONLY the frontend: React 18 + Vite, plain JavaScript (JSX), plain CSS with design tokens. There is no backend yet. Everything runs on a mock API layer in src/services whose function signatures and JSON shapes mirror the SRS, so the real Node/Express and Python/FastAPI services can replace it later without touching any page.

POSITIONING (never lose this)
CivicLens is NOT another complaint website. Pakistani portals already do registration, complaint IDs, tracking, routing, escalation, feedback and dashboards. CivicLens is an AI intelligence and accountability layer over that workflow. Conventional: Submit → Assign → Track → Resolve → Feedback. CivicLens: Understand → Extract → Classify → Prioritise → Route → Detect related issues → Monitor SLA → Escalate → Verify resolution → Audit AI decisions.
Example: a citizen writes (Roman Urdu) “Gali mein 3 din se gutter overflow ho raha hai aur smell bohat zyada hai.” The system shows: Language = Roman Urdu · Category = Sewerage (0.91) · Issue = sewer overflow · Duration = 3 days · Urgency = High (0.87, with reasons) · Department = Sewerage Dept (0.91) · 8 related complaints · Explanation = “Indicators: gutter, overflow, smell”.

FOUR PRINCIPLES THE UI MUST VISIBLY EMBODY
•	AI recommends, humans decide. Every AI output is labelled “AI recommendation” with a confidence estimate, a plain-language reason and a model version. Low confidence goes to a human review queue. AI can never close or delete a complaint.
•	Original text is sacred. Show the citizen’s words exactly as written, in their own text direction (dir=auto). Normalised text is a separate, clearly labelled derived field.
•	Citizen-confirmed resolution. An officer or admin can never mark “Resolved”. Officers submit a resolution; the citizen accepts or rejects it (rejection needs a reason, reopens the case, and escalates after 2 rejections).
•	Everything AI does is auditable. Append-only audit trail with no edit or delete controls; every override stores AI value, human value, reason, user and time.

WORDING RULES
Use “recommends”, “estimates”, “predicts”, “potential duplicate”, “AI-proposed cluster”. Never write “guarantees”, “proves”, “automatically resolves”, “detects fraud”, and never imply integration with or endorsement by any government portal. Confidence is always an estimate. Show a quiet persistent notice: “Academic prototype — not an official government portal.” Any number that looks like a result (accuracy, F1, override rate, counts) carries a visible “Demo data” badge. Never present invented numbers as experimental results.

DESIGN LANGUAGE (inspired by the Suthra Punjab portal, adapted)
•	Modern gov-tech aesthetic: polished, marketing-grade, long-scroll public pages with alternating light and dark sections and generous whitespace. Attractive but minimal: no clutter, no decorative noise.
•	Colour tokens: deep emerald primary (emerald-50 #ECFDF5, 100 #D1FAE5, 500 #10B981, 600 #059669, 700 #047857, 800 #065F46, 900 #064E3B); near-black dark sections (ink-900 #0B1210, ink-800 #111C18) reserved for technology/monitoring storytelling; soft grey page backgrounds (#F6F8F7, #EEF2F0, border #E2E8E5); text #0F172A and muted #475569; one warm accent for primary CTAs (amber #F59E0B with DARK text #1F1300, never white text on amber). AI accent indigo (#4F46E5, tint #EEF2FF) used ONLY for AI-generated content. Urgency colours always paired with icon and text: Low #2563EB, Medium #B45309, High #C2410C, Critical #B91C1C. Status: success #15803D, warning #B45309, danger #B91C1C, info #1D4ED8. All text/background pairs at least 4.5:1.
•	Typography: Inter (400–800) for Latin; Noto Naskh Arabic for Urdu UI text; Noto Nastaliq Urdu only for large Urdu hero headings (line-height 2 or more). Editorial rhythm: small uppercase kicker → large bold headline → short lead paragraph → supporting cards. Oversized bold tabular numerals as the hero visual for statistics. Roman Urdu is ordinary LTR Latin text.
•	Shape and depth: radius 8/12/16/24, soft layered shadows, 1px borders, spacing scale 4/8/12/16/24/32/48/64/96, 12-column container (max 1200px, 20px side padding on mobile).
•	Dark theme via [data-theme=dark] token overrides; light is default, a no-flash theme script runs in index.html.

MOTION AND LOADING CATALOGUE (use these consistently; animate only transform and opacity)
•	Scroll reveal: fade-up 24px, 600 ms, ease-out, once, staggered 80 ms with a CSS variable (--i), via IntersectionObserver. Animated number counters: 1.4 s easeOutExpo, tabular-nums, start on first view.
•	Hover: cards lift 4px with deeper shadow and icon tint (200 ms); buttons lift 1px with shadow, press scale 0.98, loading state with spinner; links get an underline that grows from the inline-start (RTL-aware); table rows highlight; images zoom 1.04 inside overflow-hidden frames.
•	Navbar: transparent at top, becomes white/blurred (backdrop-filter) with a subtle shadow after 16px scroll. Route changes: 250 ms fade-up on the outlet, a thin top loading bar while lazy routes load, a branded full-screen loader on first load only.
•	Loading states: shimmer skeletons for EVERY data region (cards, rows, charts, maps), spinners inside buttons, “AI is analysing” typing-dots with pipeline steps lighting up in sequence. Never show a blank region or layout jump.
•	Overlays and feedback: modal scale-in with backdrop fade, drawers slide from the inline-end, toasts slide in, accordions animate height, timeline connectors draw in, success checkmarks draw, errors shake once, hero background orbs float slowly.
•	Reduced motion: under prefers-reduced-motion disable all non-essential motion (keep opacity fades of 150 ms or less) and make counters jump to their final value. No animation libraries.

TECH RULES
•	Dependencies allowed: react, react-dom, react-router-dom v6, leaflet, leaflet.markercluster, leaflet.heat, recharts (charts only, wrapped in src/components/charts). Dev only: eslint, prettier, eslint-plugin-jsx-a11y, vitest. Nothing else.
•	Plain CSS with custom properties. Use CSS LOGICAL properties everywhere (margin-inline-start, padding-inline, inset-inline-end, text-align: start); never margin-left, float:left or similar where a logical property exists.
•	State: React Context + useReducer. localStorage allowed for the mock session, language and theme. Route-level code splitting with React.lazy + Suspense; Leaflet and Recharts load only on pages that need them. Never use dangerouslySetInnerHTML.
•	Performance: citizen portal initial load under 1.5 MB excluding map tiles and user images, usable at 1 Mbit/s; pages under 3 s; maps of 5,000 points render in under 4 s (clustered).
•	Viewports 360 px to 1920 px. Citizen UI is mobile-first; staff UIs are desktop-optimised and usable on tablets (tables collapse to cards under 768 px).

INTERNATIONALISATION AND ACCESSIBILITY
•	Own tiny i18n (no library): t(key, vars), en.json and ur.json containing EVERY UI string; no hard-coded text in components. Write simple everyday Urdu and note at the top of ur.json that a native speaker should review it. Language preference persists. Urdu sets <html lang=ur dir=rtl>; direction-implying icons mirror; complaint text always keeps its own direction.
•	WCAG 2.1 AA as far as practicable: landmarks, labelled controls, keyboard operation, visible 2px focus ring, skip link, aria-live for toasts and async status, focus trap and focus return in dialogs, colour never the only carrier of meaning. Staff shortcuts: “/” focuses search, arrow keys move through lists, “?” opens shortcut help.
•	Errors appear beside the field, in the user’s language, saying what is wrong and how to fix it. System errors show a generic message plus a reference code, never stack traces.
•	Irreversible or important actions (Reject Resolution, Override AI, Reassign, Activate/Rollback model, Deactivate user) use a confirm dialog, with a mandatory reason where the SRS requires one.

ROLES
Citizen (mobile-first; sees only own complaints), Officer (own assignments/department), Supervisor (own department; reassigns, handles escalations and the review queue), Administrator (configuration, analytics, audit; has NO “resolve complaint” action). The n8n engine and an offline researcher have no UI.

COMPLAINT LIFECYCLE
Submitted → AI Processing → (Pending Analysis if the AI service is down) → Pending Human Review (low confidence) or Assigned → In Progress → Resolution Submitted → Citizen Verification → Resolved or Reopened → Escalated → Closed; plus Rejected/Invalid (human decision with reason only) and Resolved (Unverified) after a policy timeout.
Queued low-confidence complaints get no SLA timer, no assignment and no officer notification until a reviewer confirms routing (except emergency rules). Duplicates are linked only after officer confirmation and nothing is deleted.

DEFAULT THRESHOLDS (initial values, configurable, marked TBD after experiments)
Text 10–2,000 characters · up to 5 images (JPEG/PNG, 5 MB each) · 10 submissions per citizen per hour · language confidence 0.60 · classification confidence 0.70 · department confidence 0.75 · duplicate radius 500 m · duplicate window 30 days · SLA warning at 75% elapsed · SLA-risk refresh every 15 min · escalate after 2 rejections · reopen window 14 days · review-queue alert after 24 h · access token 15 min · account lock 15 min after 5 failed logins · password reset token 30 min · emergency numbers Police 15 and Rescue 1122 (configurable).

FOLDER STRUCTURE
src/ main.jsx, App.jsx, routes.jsx · config/constants.js · i18n/ (en.json, ur.json, I18nContext) · styles/ (tokens.css, base.css, utilities.css, animations.css, rtl.css, print.css) · context/ (Auth, Theme, Demo, I18n) · services/ (api.js, mock/) · hooks/ · components/ ui, layout, marketing, complaint, ai, map, charts, guards · pages/ public, auth, citizen, officer, supervisor, admin, shared, dev · utils/ · docs/ PROJECT_CONTEXT.md, PROGRESS.md, ROUTES.md, DATA_SHAPES.md.

WORKING RULES FOR EVERY PHASE
•	Build exactly what the current prompt asks; do not jump ahead. Prefer small, reusable, props-driven components with their own CSS file.
•	Every data region implements four states: loading (skeleton), empty, error (with retry and reference code), success.
•	Do not fabricate evaluation results, real statistics, real citizen data or government integrations. Do not clone any reference site’s logo, text or imagery.
•	If something is ambiguous, make a sensible assumption, state it in your summary, and keep going. Do not ask me to restate the project.
