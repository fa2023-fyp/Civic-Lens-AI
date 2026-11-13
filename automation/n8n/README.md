# n8n automation (supporting engineering)

Import the JSON files from **Workflows → Import from File**. The SLA reminder and breach workflows have scheduled triggers and call the backend endpoints. Replace the `REPLACE_WITH_N8N_WEBHOOK_SECRET` header value with the same local `N8N_WEBHOOK_SECRET` used by the backend, then activate them. The reminder endpoint creates one notification record per approaching case; the breach endpoint creates an escalation record once per overdue case.

Workflows are automation examples, not research novelty. Email and SMS integrations are intentionally not configured; notification records are stored locally without paid providers.

The new-complaint, citizen-verification, and rejection templates are inactive webhook examples and require deployment-specific event wiring and webhook authentication before activation. Never expose unauthenticated n8n webhooks publicly.
