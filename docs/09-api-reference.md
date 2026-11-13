# 09 · API reference

Interactive OpenAPI: backend `http://localhost:3000/docs`; AI `http://localhost:8000/docs`.

## Backend

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create citizen account |
| POST | `/api/auth/login` | Public | Issue JWT |
| GET / POST | `/api/complaints` | Auth / citizen | List authorized complaints; multipart complaint submission with optional `images` |
| GET | `/api/complaints/{id}` | Auth | Complaint detail and timeline; citizen sees only own record |
| POST | `/api/complaints/{id}/review` | Officer/supervisor/admin | Record review/override; non-empty `reason` required |
| POST | `/api/complaints/{id}/resolutions` | Officer | Submit proposed resolution, optional before/after images and coordinates; opens citizen verification |
| POST | `/api/complaints/{id}/verify` | Owning citizen | `accepted: boolean`; rejection reopens and escalates |
| POST | `/api/complaints/webhooks/sla-reminder` | Shared secret | Records a local reminder notification for approaching deadlines |
| POST | `/api/complaints/webhooks/sla-breach` | Shared secret | Finds overdue cases and records escalation |
| GET | `/api/admin/audit` | Admin | AI decision log; `?format=csv` exports CSV |
| GET | `/api/admin/analytics` | Admin/supervisor | Category aggregates and AI override/low-confidence rates |
| GET | `/api/admin/heatmap` | Admin/supervisor | Coarsened non-synthetic location aggregates; cells with fewer than three records are suppressed |
| GET | `/api/admin/users` | Admin | User list |

Authentication: `Authorization: Bearer <JWT>`. Do not use the development fallback secret outside local development.

## AI service

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service health |
| POST | `/analyze` | Language, normalization, extraction, category/urgency/department suggestions, related lexical matches, review flag |
| POST | `/similarity` | Lexical related-complaint baseline |
| POST | `/clusters` | Lexical grouping with optional coordinates/time filters |
| POST | `/sla-risk` | Experimental transparent SLA risk estimate |

The current related-complaint and cluster methods are lexical, not multilingual semantic embeddings.
