# 10 · Human-in-the-loop and audit

## Confidence policy

`AI_REVIEW_THRESHOLD` defaults to `0.55`. The AI service sets `needs_human_review` when the minimum category, department, or urgency confidence is below the threshold. Complaint creation stores the result in `needs_human_review` and uses the visible status `Human Review`. Frontend copy says: **“AI confidence below threshold. Send to human verification queue.”**

Every confidence display is labeled **model confidence**. It must not be presented as a probability of correctness unless calibration has been measured.

## Officer control

Officers can provide corrected category/department/urgency and must supply a non-empty reason. The initial AI decision remains preserved; a correction is inserted as another `ai_decisions` row with human correction, reason, final decision, and deciding user. The database rejects update/delete operations on this audit table.

## Citizen confirmation

An officer submits a proposed resolution, which changes status to `Citizen Verification`; this is not closure. The citizen accepts to move to `Resolved`, or rejects to move to `Reopened` and create an escalation record. The citizen's response is retained in `verifications` and status history.

## Metrics

Admin analytics calculates override rate and low-confidence routing rate from actual AI audit rows; values remain null when no decisions exist. Synthetic demonstration records without model decisions are excluded from those denominators. Interpret rates alongside coverage and subgroup performance.
