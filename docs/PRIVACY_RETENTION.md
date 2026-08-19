# Privacy & Retention Policy

MarketPulse collects only information required for account operation, field verification, security and auditability.

## Data classes and retention
- **Account/profile:** retained while the account is active and while legally/operationally required after a deletion request.
- **Field GPS:** exact latitude/longitude is used to validate market presence. For closed observations it is automatically redacted after 730 days; market-distance evidence and verification outcome remain.
- **Evidence photos:** rejected-observation evidence becomes eligible for deletion after 365 days; verified-observation evidence after 730 days. Candidates are reviewed before Storage deletion so disputes/legal holds are not destroyed automatically.
- **Accuracy reports:** resolved/dismissed reports are de-identified after 730 days by removing reporter identity and free-text notes.
- **Client error telemetry:** resolved events are deleted after 90 days; all telemetry expires after 180 days.
- **Audit records:** retained for operational accountability and fraud/security investigation. Audit payloads must not be used for unrelated profiling.

## Automated enforcement
`private.apply_retention_policy()` runs daily through `pg_cron`. It deletes expired telemetry, redacts old GPS, and de-identifies closed reports. Evidence deletion is deliberately review-gated because Storage deletion is irreversible.

## User rights workflow
Profile → Privacy & data rights supports access, export, correction and deletion requests. Requests are stored in `privacy_requests` with an auditable status. Deletion is reviewed rather than immediate so MarketPulse can preserve records needed for fraud prevention, disputes, security, statutory obligations and price-verification integrity.

## Sensitive-data rules
- Never expose service-role keys in frontend code.
- Evidence bucket is private; use signed/authorized retrieval only.
- Do not store raw passwords.
- Do not fabricate or persist GPS/EXIF data.
- Date of birth and gender remain optional profile fields and are not used to calculate price confidence or agent reputation.
