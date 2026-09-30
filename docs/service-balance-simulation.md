# Client service balance check

These are **deterministic scripted simulations, not new-player playtest results or forecasts**. The long-run harness starts from the free-play January 2026 opening state and advances 24 months across seeds `7, 23, 41, 89, 127`. Each value below is the mean of five runs, rounded as shown. The opening January snapshot is excluded from cumulative profit and event counts. The Phase 4 rerun on September 30 reproduced the Stage 1 table below; no gameplay rules changed in slice D.

## Phase 4 guided-case branch report · January–April

`bun run scripts/case-branch-report.ts` starts every branch from the same authored January fixture and runs five seeded trials for each scripted choice policy. It fails if a choice is unavailable, a required decision blocks advancement, or AR/cash/profit fail reconciliation. It records the ordinary engine's signing and renewal draws, monthly credit, service, staff fatigue/capability, and remaining decisions. The script does not simulate human timing, exploration, or reasoning.

| Five-seed result | Decline and serve | Pursue and prioritize | Hold and defer |
| --- | ---: | ---: | ---: |
| Reviewed prospect signed | 0/5 | 2/5 | 0/5 |
| Anchor renewed / departed | 4 / 1 | 5 / 0 | 3 / 2 |
| Pursuit expense in each run | $0 | $3,000 | $0 |
| Major partner interventions in each run | 1 | 2, in different months | 0 |
| Mean April cash / peak credit drawn | $72,338 / $67,481 | $70,059 / $69,281 | $75,778 / $72,881 |
| Mean February–April profit | $45,926 | $55,135 | $42,741 |
| Mean ending effective service slots | 8.1 | 8.1 | 8.1 |
| Mean ending burnout / efficacy | 15.0 / 81.0 | 19.8 / 81.0 | 15.0 / 81.0 |
| Pending case / other decisions in April | 0 / 0 | 0 / 0 | 0 / 0 |

The decline branch makes a January demand, declines the reviewed prospect, delegates the policy update, and spends the March partner intervention on the other client's complaint. The pursuit branch makes a personal collection call, pays for aggressive pursuit, personally handles the policy delay, and delegates the complaint. The hold branch holds collection and the reviewed prospect after intake review, then defers both March responses. Every branch reaches April. The pursuit fee is paid whether or not signing succeeds; a successful signing adds workload. All branches draw credit in February, so the cash balance includes borrowing and must not be described as operating income or collection success. Differences across these policies are **not** controlled treatment effects: decisions change later cash, client rosters, and random draw consumption. The five trial outcomes do not measure real-world renewal rates.

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

## Phase 2 authored-case fixture and branch checks

The authored case uses a separate January 2026 opening fixture; the five-seed, 24-month table above continues to describe the original free-play opening and scripted policies. The case starts from the ordinary firm initialization, then sets cash to $45,000, records an $18,000 TechTrade Association receivable in the 61–90 day bucket, and shortens that client's contract to three months. The existing $15,000 unassigned current receivable remains. Opening AR is therefore $33,000, with $18,000 explicitly named and overdue. Opening billed revenue is $111,000, expenses $94,411, reported profit $16,589, estimated tax payable $5,530, service coverage approximately 100.7%, and the $100,000 line of credit is undrawn. Cash and the January opening history agree; this is an opening P&L run-rate snapshot, not a paid month of recurring costs. Exact-value assertions protect this fixture for the D1 study.

These amounts create a profitable firm with limited spendable cash and an actionable old invoice. The case is intended to allow a collection-oriented path and a cautious cash-preservation path. Automatic credit draws and repayments remain part of the ordinary monthly transition; a draw is financing, not collected revenue or profit.

Focused case checks cover different questions from the 24-month aggregate: January collection or closing collection efforts must reconcile cash, AR, and profit; February's decline or hold creates no client; the conflicting original mandate cannot be signed; a reviewed narrower pursuit pays its stated cost even when signing fails and adds workload only on success. March's external committee delay must occur regardless of the prospect result, while the partner's response and another client's complaint compete for the shared intervention. April must use the ordinary service/satisfaction renewal transition, with both renewal and departure able to reach the terminal case state. Zero-staff and poor-management paths test that progression does not depend on a favorable random draw.

These are model and branch checks, not observed player choices, time-on-task measurements, or evidence that the case teaches the intended concepts. Prediction prompts and causal review are implemented; the [D1 learning study](learning-study-kit.md) still needs participants.

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
