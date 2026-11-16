# Public sitemap

| Path | Page | Content |
|---|---|---|
| `/` | Home | Hero, statistics, Explore CivicLens, journey, phone preview, and closing call to action |
| `/features` | Features | Product pillars, service capabilities, and workflow comparison |
| `/technology` | Technology | Lazy-loaded analyzer demo, pipeline stages, and transparency link |
| `/how-it-works` | How it works | Public workflow route |
| `/about` | About | Project mission, recognition cards, image band, and academic project details |
| `/help` | Help | Frequently asked questions and emergency information |
| `/transparency` | AI transparency | Prototype decision and limitation information |
| `/contact` | Contact | Local-only demo contact form and emergency/project details |

Public pages use `PublicLayout`, localized route titles, and route-based navigation. Route changes scroll to the top and retain the existing loading and page-transition treatment.

## Other routes

| Path | Page | Phase |
|---|---|---|
| `/login`, `/register` | Authentication | Public/auth |
| `/forgot-password`, `/reset-password` | Password recovery | Public/auth |
| `/citizen/*` | Citizen portal | Role-restricted |
| `/officer/*`, `/supervisor/*`, `/admin/*` | Staff portals | Role-restricted |
| `/dev/tokens` | Design-token and motion preview | Temporary development route |
| `/dev/ui` | Reusable UI component gallery | Development only |
