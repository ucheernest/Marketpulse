# MarketPulse Operational Runbook

## Scope
This runbook covers the Port Harcourt pilot and the production path from field capture to public verified price publication.

## Severity levels
- **SEV-1:** public app unavailable, authentication unavailable, evidence/storage outage, corrupted published prices, or suspected account compromise.
- **SEV-2:** verification queue blocked, agent submissions failing, stale prices across multiple markets, recurring frontend errors, or one market producing systematically bad data.
- **SEV-3:** individual inaccurate-price reports, a single agent recheck, isolated UI defect, or non-critical data-quality issue.

## Agent submits suspicious or bad data
1. Do not publish the observation.
2. In Admin → Verification, inspect evidence, GPS distance/accuracy, captured timestamp, confidence components, agent reputation and recent observations for the same product.
3. Choose **Reject** when evidence clearly contradicts the submission, the pack/unit is wrong, or the price is impossible.
4. Choose **Request recheck** when the evidence is incomplete/ambiguous or the market price may genuinely have changed.
5. Record a specific decision reason. The backend writes the verification and audit trail.
6. Repeated abuse: review the agent account, deactivate field access, and investigate all recent observations from that agent before republishing affected products.

## Evidence upload/camera failure
- The submission must not be accepted without evidence.
- Agent should keep the capture in the owner-scoped offline queue and retry when connectivity returns.
- Confirm `price-evidence` Storage is healthy and that the agent's authenticated session is valid.
- Never switch to gallery-only or evidence-optional submission as a workaround.

## GPS failure
- Require a fresh device location. Client rejects stale location and poor accuracy before submission.
- If geofence distance is outside the configured market radius, request a new capture from inside the market.
- Do not manually invent coordinates or override geofence checks in the browser.

## Stale public prices
- Public price freshness is based on approved observation capture time.
- Prices older than 72 hours must be treated as stale/limited data.
- If a high-volume product becomes stale, create recheck assignments in at least two independent markets before presenting a renewed high-confidence value.

## Market disablement
Use Admin → Catalog/Markets. Deactivate a market when it is closed, inaccessible, relocated, compromised, or its geofence is materially wrong. Existing audit/observation history remains. New agent assignments and new captures must use an active market.

## Inaccurate-price reports
1. Review the report against the currently published product/market snapshot.
2. Compare the latest verified observations and evidence.
3. If credible, request fresh field checks and keep the report under investigation.
4. Resolve only after the price is confirmed/corrected; dismiss with notes when evidence does not support the report.

## Client/runtime errors
Authenticated frontend errors are stored in `client_error_events` and appear in Admin → Production readiness. Resolve only after reproducing or confirming the relevant deployment/configuration fix.

## Incident response
1. Record incident start time and affected surface.
2. Freeze risky admin changes if data integrity is uncertain.
3. Check GitHub/Vercel deployment status, Supabase Auth/API/Storage logs and the `marketpulse-health` function.
4. If a release caused the issue, roll back to the last successful Vercel deployment/Git commit.
5. If data was changed incorrectly, stop publication, identify affected rows from audit logs, restore/correct from a verified backup where appropriate, then refresh public snapshots.
6. Record remediation and post-incident actions.
