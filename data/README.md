# Data Directory — Status

All processed files carry a `meta` block with source URL, vintage, and retrieval date. The methodology page will be generated from these.

| # | Dataset | File | Status |
|---|---------|------|--------|
| 1 | BLS state unemployment (counts + rates, Apr 2026) | `processed/bls_state_unemployment.json` | ✅ Done, sanity-checked. Refresh available July 21 (June release). Follow-up: add U-6 components (underemployed + marginally attached) from separate BLS table. |
| 2 | ASCE infrastructure needs/funded/gap by category, 2024–33 | `processed/asce_infrastructure_gaps.json` | ✅ Done, totals verified ($9,139B need / $3,689B gap). Known limitation: national only — state allocation requires proxy method (lane-miles, bridge counts, or population). |
| 3 | Living wage by state | `processed/living_wage_DECISION_NEEDED.json` | 📤 Licensing request submitted to Living Wage Institute via MIT contact form (July 18, 2026). BEA Regional Price Parities remains the fallback. |
| 4 | Childcare gap by state | `processed/childcare_gap.json` | 🟡 National figures done (14.8M need / 10.8M slots / 4.2M gap, Sept 2025 Child Care Gaps Assessment). State-level extraction from childcaregap.org pending + terms-of-use check. |
| 5 | BEA labor-share coefficients by industry | `processed/labor_share_coefficients.json` | 🟡 Structure + preliminary ranges + Levy alternative documented. Exact coefficients need BEA table download (build-phase task). KEY DECISION captured: Levy method (wages + 25% non-labor markup) recommended as v1 engine default; BEA labor-share as cross-check. |

## Next data tasks
- BEA Regional Price Parities by state (if Option B chosen for living wage)
- FHWA lane-miles + FHWA/NBI bridge condition counts per state (allocation proxies for ASCE gaps)
- BLS U-6 style state data (broader potential-worker pool)
