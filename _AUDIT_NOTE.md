# Audit Apply Notes — AIFleetMaintenanceScheduler

Audit source: `_AUDIT/reports/batch_03.md` (#33). Verdict: partial-build (26 routes, 3 AI endpoints).

## Reality check

Existing AI endpoints already include `predictive-maintenance`, `fleet-analytics`, `cost-analysis`, plus several others. So the audit's `/maintenance-predict`, `/preventive-schedule-optimize` are effectively present.

## Implementations applied

Added three AI endpoints to `backend/routes/ai.js` matching existing patterns (`callOpenRouter`, `persistAIResult`):

1. `POST /api/ai/parts-order-predict` — pulls top parts usage over a lookback window plus upcoming maintenance volume; AI returns recommended PO list, stockout risks, savings estimate.
2. `POST /api/ai/technician-assign-optimize` — pulls open work orders + active technicians; AI returns WO→tech assignments, unassigned reasons, workload warnings.
3. `POST /api/ai/warranty-claim-assist` — pulls vehicle warranty + maintenance history; AI judges coverage, drafts claim narrative, lists supporting docs.

DB queries are best-effort (`.catch(() => ({ rows: [] }))`) so endpoints stay usable even before optional tables exist. Syntax-checked via `node --check`.

## Backlog (prioritized)

### Mechanical
- Wire AI endpoints into a unified "AI Center" listing for frontend.
- Add structured (JSON) variants of the existing `predictive-maintenance` analysis.

### Needs creds / external
- Vehicle telematics integration (DTCs, engine data).
- Parts-supplier price/availability APIs (NAPA, AutoZone, etc.).
- Mobile technician work-order app.

### Needs product decision
- Driver-behavior data source and labeling for the audit's `driver behavior analytics` custom feature.
- Real-time vehicle GPS provider.

### Custom features
- Mobile technician app.
- Driver behavior analytics.
- Fleet replacement planner (already partially present).

## Apply pass 3 (frontend)

- **Stack:** Vite + React frontend, Express backend. `services/api.js` adds `Authorization: Bearer ${localStorage.getItem('token')}` to every request.
- **Backend AI endpoints surfaced:** `/predictive-maintenance`, `/fleet-analytics`, `/route-optimization`, `/compliance-check`, `/cost-analysis`, `/driver-performance`, `/fleet-replacement-score`, `/parts-order-predict`, `/technician-assign-optimize`, `/warranty-claim-assist`, `/results`.
- **Action:** LEFT-AS-IS — FE already wired.
- Components: `AIInsights.jsx`, `AIHistory.jsx`, and `AIAdvanced.jsx` (which specifically calls the three apply-pass-2 endpoints `/parts-order-predict`, `/technician-assign-optimize`, `/warranty-claim-assist`).
- Files written/modified: none.
- Syntax check: N/A.

## Apply pass 4 (mechanical backlog)

- **Action:** LEFT-AS-IS — no remaining MECHANICAL backlog items.
- **Backlog reviewed:** unified AI Center wiring (ALREADY-DONE), structured JSON variants of `predictive-maintenance` (NEEDS-PRODUCT-DECISION — overlaps existing parser), telematics/parts-supplier/mobile app (NEEDS-CREDS), driver-behavior data + GPS provider (NEEDS-PRODUCT-DECISION).
- **Files written/modified:** none.
- **Smoke test:** N/A.
