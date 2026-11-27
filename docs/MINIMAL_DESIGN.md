PURPOSE
Make CivicLens AI calm, focused and trustworthy: fewer elements, more whitespace, one clear action per view. Keep the Suthra-inspired emerald identity but strip decoration. This is a visual refinement of the existing app. No new features, no behaviour changes, no new dependencies.
SIX PRINCIPLES
•	Remove before adding. If a border, shadow, gradient, colour or element does not help the user decide or act, delete it.
•	One primary action per view (solid emerald). Everything else is secondary (hairline outline) or a text link.
•	Whitespace is structure. Group with space, separate with hairlines, not with boxes inside boxes.
•	Align everything: one container, one grid, one spacing scale, start-aligned text (this also makes RTL correct).
•	Motion is feedback, not decoration: small, fast, purposeful.
•	Trust cues never get removed for looks: “AI recommendation” labels, confidence estimates, the prototype notice, Demo data badges, SLA states with text and icon, human-override reasons.
COLOUR
•	Neutrals are about 90% of the interface. Page #FFFFFF, tint #F7F9F8, text ink #0F172A, muted #5B6B65 (passes AA), hairline #E5EAE8.
•	Emerald (#047857, hover #065F46) only for primary buttons, links, active navigation, focus rings and key numerals.
•	AI indigo (#4F46E5) only inside AI components, as text or a thin accent bar. Never as the background of a large area.
•	Status colours only for badges, alerts, SLA and urgency, using tints at 10% opacity or less with AA-contrast text. Amber is retired as a call-to-action colour and remains only the warning colour.
•	No decorative gradients, no floating orbs, no glass effects. The only blur allowed is the navbar after scrolling. The whole public site has exactly one dark section (the Technology page). Dark theme follows the same rules.
TYPOGRAPHY
•	Inter, weights 400, 500, 600 only. Scale 12 / 14 / 16 / 18 / 24 / 32 / 48 (hero up to 56). Body 16 on 1.6, UI text 14. Headings 600, letter-spacing −0.01em, line-height 1.2.
•	Kicker: 12 px uppercase, 0.08em tracking, brand colour. Lead paragraph: 18 px muted, maximum 60 characters wide. Numerals are tabular. Urdu body uses Noto Naskh Arabic at line-height 1.9; Nastaliq only for the hero headline.
SPACE AND ALIGNMENT
•	8 px scale (4 px for tight spots). Section vertical padding 96 / 64 / 48 (desktop / tablet / mobile). Page gutters 48 / 32 / 20.
•	Containers: public 1200, staff 1320, single-column forms 640, auth card 400. Text measure at most 65 characters.
•	Headings and text are start-aligned everywhere; only the closing call-to-action may be centred.
•	Cards in a row have equal height and a 24 px gap. Card padding 24, list-row padding 16. Icons 20 px in the UI and 24 px in feature blocks, outline style, 1.75 stroke.
•	Page header pattern on every app page: title (24/600), one muted description line, actions at the inline-end, 24 px gap before content.
SHAPE AND DEPTH
•	Radius: 8 controls, 12 cards, 16 modals, 999 pills. Borders: 1 px hairline. Shadows: none by default; a very light shadow only on hover of clickable cards and on popovers; a stronger one only on modals.
PUBLIC NAVIGATION (minimal)
•	Height 64 px (56 on mobile). White background, no shadow; after scrolling past 16 px a 1 px hairline appears at the bottom and a light blur is allowed.
•	Start side: logo mark plus wordmark “CivicLens” and a small Prototype pill whose tooltip reads “Academic prototype — not an official government portal.” The old top banner is removed; the full sentence lives in the footer.
•	Links: at most five text links (Features, Technology, How it works, About, Help). Home is the logo. Active link: brand colour with a 2 px underline; hover: underline grows from the inline-start in 200 ms.
•	End side: one Preferences icon button (globe) that opens a small popover with the EN | اردو switch and Light / Dark / System. Then, logged out: “Log in” as a text link plus one solid emerald button “Submit a complaint”; logged in: an avatar menu (Dashboard, Profile, Log out).
•	Mobile (below 900 px): logo and a hamburger. The menu is a clean full-screen sheet with large stacked links that fade in with a 40 ms stagger, the primary button at the bottom, Preferences row, Esc to close, focus trap, body scroll lock.
HOVER, PRESS AND FOCUS SPEC (use these and nothing else)
•	Text links: colour shifts to brand and an underline grows from the inline-start (scaleX 0 → 1, 200 ms).
•	Primary button: background one step darker, lifts 1 px, shadow-sm; pressed: no lift and scale 0.98; an arrow icon nudges 3 px in the reading direction.
•	Secondary and ghost buttons: border turns brand and a 4% brand tint fades in.
•	Clickable cards: border becomes emerald-200, lifts 2 px, shadow-sm, arrow nudges 3 px. Cards that are not clickable have no hover effect.
•	Table rows and menu items: 4% tint; row action icons fade in; menu items show a 2 px inline-start indicator.
•	Icon buttons: a circular tint fades in and scales from 0.9 to 1.
•	Inputs: border darkens on hover; on focus, a 2 px brand ring at 30% opacity and a brand border.
•	Images (gallery, image cards only): scale 1.03 inside an overflow-hidden frame.
•	Entrances: scroll reveal is a 12 px fade-up over 400 ms, 60 ms stagger, once. Page change: 180 ms fade. Modal: scale 0.98 → 1 with fade, 180 ms. Toast: 8 px slide and fade. Counters: 1.2 s ease-out, once.
•	Loading: a thin 2 px top bar on route changes, calm skeletons, a spinner inside buttons, and a plain fading logo mark as the first-load screen.
•	Allowed to animate: transform, opacity, colour, background-color, border-color. Durations only from tokens (120 / 200 / 400 ms). Under prefers-reduced-motion, keep colour changes and opacity fades of 150 ms or less and remove movement.
NEVER
Do not remove focus styles, keyboard access, loading / empty / error states, RTL or dark-mode support. Do not make clickable things look unclickable: a primary button must still look like a button. Do not change copy, props, routes, API calls or behaviour. START
I pasted a Minimal Design Brief above. This prompt only creates documentation and one npm script. Do not scan or change any source file.
SCOPE (the only files you may edit)
docs/, package.json, AGENTS.md (create if missing).
TASKS
•	Save the brief I pasted, verbatim, as docs/MINIMAL_DESIGN.md.
•	Create docs/MINIMAL_PROGRESS.md with a checklist of numbered items 1–34 (titles can be placeholders) and a “Notes” section.
•	In package.json add the script "audit:style": "node scripts/audit-style.mjs" (the script file is already in scripts/; do not edit it).
•	Append a section “MINIMALISM RULES” to AGENTS.md containing: read docs/MINIMAL_DESIGN.md once per task; visual refinement only; edit only the files named by the prompt; never remove trust cues, states, focus styles, RTL or dark mode; run the build once and reply in 5 lines.
DONE WHEN
•	docs/MINIMAL_DESIGN.md matches the pasted brief exactly.
•	npm run audit:style runs and writes docs/MINIMALISM_AUDIT.md.
•	No source file changed.
WHEN YOU FINISH
Reply in 3 lines or fewer. Do not run the build.
