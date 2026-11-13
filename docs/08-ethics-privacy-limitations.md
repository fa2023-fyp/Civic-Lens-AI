# 08 · Ethics, privacy, and limitations

## Human accountability

AI recommendations can be wrong; confidence is a model score, not certainty. Low-confidence results are routed to review. Officers remain responsible for urgency and department decisions and must provide a reason when reviewing or overriding. Rejection by the citizen reopens the case and records an escalation. Neither an officer submission nor an image proves physical repair.

## Data minimization and security

- Keep secrets in environment configuration; rotate local demonstration secrets.
- Passwords are bcrypt-hashed, access is role-checked, and SQL uses parameters.
- Uploaded evidence is limited by count, size, and MIME type; production still needs malware scanning, private object storage, authorization controls, and retention/deletion policy.
- Aggregate analytics must suppress or coarsen small-location groups before public display. Do not include names, contact details, exact citizen locations, or complaint text in public maps.
- Do not upload real complaints or personal information to an external model/provider without an approved legal, privacy, and security review.
- Add consent, purpose limitation, access logging, retention limits, incident response, and secure backups before any real deployment.

## Known model risks

Pakistani multilingual training data is not included. Roman Urdu spelling variation, mixed-language code switching, script imbalance, class imbalance, and locality variation can produce unequal error rates. False duplicate matches can suppress independent reports; missed duplicates can hide recurrent problems. Incorrect urgency or routing can delay needed action. Explanation strings are simple cues, not causal evidence.

## Scope limits

There is no government portal integration, validated production model, or evidence that AI replaces officers. Rule and SLA baselines are experimental. Synthetic data is not real, representative, or suitable for service decisions. Automated systems cannot reliably verify physical repairs; citizen feedback provides a human signal, not proof.
