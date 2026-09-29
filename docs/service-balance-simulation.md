# Client service balance check

These are **deterministic scripted simulations, not new-player playtest results or forecasts**. The harness starts from the January 2026 opening state and advances 24 months across seeds `7, 23, 41, 89, 127`. Each value below is the mean of five runs, rounded as shown. The opening January snapshot is excluded from cumulative profit and event counts.

## Stage 1 rules and truthful copy — 24-month, five-seed run

The updated harness uses the shared partner intervention across meetings and personal collection calls. If attention or cash is unavailable for a complaint, stewardship delegates when billable staff exist, otherwise explicitly defers. A personal collection call falls back to a demand letter when attention is spent. Attempted but unavailable decisions are counted as blocked; the final run had zero blocked attempts in every policy. Pending choices under cash guard and cash pressure are intentionally unhandled vendor, partner, or budget decisions.

| Model result, five-seed mean | Stewardship | Cash pressure | Cash guard |
| --- | ---: | ---: | ---: |
| Ending / minimum cash | $449,013 / $142,166 | $208,487 / $139,375 | $216,787 / $141,275 |
| Peak / ending credit drawn | $0 / $0 | $0 / $0 | $0 / $0 |
| Credit draws | $0 | $0 | $0 |
| Cumulative profit | $341,824 | $56,088 | $64,388 |
| Ending clients / effective service slots | 7.8 / 8.2 | 5.8 / 7.2 | 5.8 / 7.1 |
| Churn / renewals | 3.6 / 11.8 | 2.2 / 11.0 | 2.2 / 11.0 |
| Ending mean burnout / efficacy | 13.3 / 82.9 | 11.3 / 71.0 | 34.6 / 71.0 |
| Ending pending decisions | 0.0 | 2.2 | 2.2 |
| Blocked attempted decisions | 0.0 | 0.0 | 0.0 |
| Recovery spend | $15,000 | $8,300 | $0 |

The workload bands remained at the initial fictional values: below 90% coverage +6 burnout, 90–under 100% +3, 100–under 115% unchanged, 115% or more −3, and no clients −3. Verification did not show broken behavior requiring a tuning change. Monthly efficacy no longer drifts with burnout, and recovery no longer buys efficacy. Removing random burnout rolls also shifted later random draws. Whole-run differences from the earlier report cannot be assigned to any single rule without a controlled comparison.

The table below preserves the earlier run as a historical reference under the prior rules; it is no longer the current Stage 1 result.

Run `bun run scripts/balance-report.ts` to reproduce the current full JSON report, including each seed. The policy choices are described in the [earlier cash-pressure report](balance-simulation.md#scripted-decisions). The historical table below was refreshed after aggressive new-client pursuit gained a $3,000 one-time cost. Stewardship chose that option; cash guard and cash pressure passed on prospects. Those policies did not use the manual **Run Collections** button or the then-separate client meeting action.

## Revised service rule

Lobbyists and attorneys provide two client slots each at 80% combined quality (70% efficacy, 30% client affinity). Burnout above 60% reduces effective slots. Support staff improve how much of that billable capacity reaches clients: without effective support the multiplier is 0.85, and it rises with support effectiveness to a 1.15 cap. The opening four billable staff and one support employee cover roughly eight clients. Each month, service coverage adjusts client satisfaction, and renewal odds are multiplied by coverage up to 100%. With no billable staff, contracts cannot renew. The dashboard and monthly alerts surface coverage shortfalls.

## Pre-Stage 1 five-seed results, 24 months

| Metric | Stewardship | Cash pressure | Cash guard (no recovery) |
| --- | ---: | ---: | ---: |
| Ending cash | $547,125 | $192,823 | -$117,238 |
| Minimum cash | $162,305 | $121,901 | -$117,610 |
| Peak / ending credit drawn | $0 / $0 | $20,000 / $20,000 | $80,000 / $80,000 |
| Cumulative profit | $482,869 | $15,610 | -$444,379 |
| Ending clients | 9.8 | 5.6 | 0.4 |
| Ending effective client slots | 9.3 | 7.7 | 0.4 |
| Churn / renewals | 3.4 / 12.2 | 2.4 / 10.6 | 7.6 / 4.4 |
| Ending mean burnout / efficacy | 21.0 / 96.4 | 36.3 / 78.8 | 100.0 / 6.0 |
| Ending reputation | 86.2 | 86.2 | 21.0 |
| Recovery spend | $27,000 | $22,900 | $0 |
| Full / targeted recovery actions | 3.6 / 0.0 | 1.8 / 9.4 | 0.0 / 0.0 |
| Ending pending inbox decisions | 0.0 | 2.6 | 2.4 |

The no-recovery policy eventually loses service capacity as staff burn out. Its client base falls sharply, and mean ending cash becomes negative. The cash-pressure policy preserves more effective capacity and clients while spending on recovery. Stewardship also pursues new business and responds differently to inbox decisions, so its results should not be attributed to recovery alone.

Seed 23 shows the remaining cash risk: cash guard ends with no clients, -$191,514 cash, and a fully drawn $100,000 credit line. Cash pressure ends with five clients and $7,379 cash, but also uses the full credit line. The revised service loop does not guarantee solvency.

## What this check can and cannot establish

The tests show that staffing choices now have a consequential path to satisfaction and retention, and that the arithmetic stays consistent over long scripted runs. Five seeds and fixed policies do not establish whether new players understand, trust, or enjoy the rule, nor whether they will choose these policies. Shared seeds also need not produce matched events when decisions change random draw consumption. Run the [new-player sessions](new-player-playtest.md) before treating the balance as settled or expanding the tax and persistence models.
