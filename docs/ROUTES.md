# Routes

| Path | Page | Phase |
|---|---|---|
| `/` | CivicLens landing page | Landing |
| `/about` | About project placeholder with PageHero | Multipage conversion |
| `/features` | Features placeholder with PageHero | Multipage conversion |
| `/technology` | Technology placeholder with PageHero | Multipage conversion |
| `/contact` | Contact placeholder with PageHero | Multipage conversion |
| `/dev/tokens` | Design-token and motion preview | Temporary development route |
| `/dev/ui` | Reusable UI component gallery | Development only |

The landing page and public pages use `PublicLayout`. Public placeholder pages are lazy-loaded with `React.lazy` and share the responsive, localized `PageHero` component. Other product routes remain placeholders until their implementation phases.
