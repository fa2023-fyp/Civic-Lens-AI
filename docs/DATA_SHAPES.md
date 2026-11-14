# Data shapes

The frontend calls replaceable services under `src/services/`. The current mock responses establish contract shapes only; they contain no operational records and no measured AI results.

## Complaint

```js
{
  id: null,
  originalText: 'exact citizen input',
  normalizedText: null,
  status: 'mock-pending',
  aiAnalysis: null,
  media: [],
  location: null,
  createdAt: null
}
```

`originalText` is preserved as submitted. `normalizedText` is a separately derived value and must never replace it. Complaint text rendered later must use `dir="auto"`.

## AI recommendation

```js
{
  language: null,
  languageConfidence: null,
  originalText: 'exact citizen input',
  normalizedText: null,
  category: { label: null, confidence: null, topK: [] },
  urgency: { label: null, confidence: null, reasons: [] },
  department: { label: null, confidence: null, reason: null },
  relatedComplaints: [],
  explanation: null,
  needsHumanReview: null,
  modelVersions: {}
}
```

Confidence fields are estimates. Every rendered recommendation must include its AI label, reason, and model version.

## Review and resolution contracts

- `reviewComplaint`: complaint ID, prior AI value, human value, mandatory reason, actor, and decision time.
- `submitResolution`: complaint ID, proposed description/action, optional before/after media, and submission time. It does not resolve a case.
- `verifyResolution`: citizen acceptance or rejection reason, resulting status, rejection count, and escalation state.
- `getAuditTrail`: ordered append-only decision entries; the UI has no edit/delete actions.
