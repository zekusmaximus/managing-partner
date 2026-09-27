# Seeded gameplay balance simulation

These are **simulation results**, not observations from human playtests. The harness starts from the January 2026 opening state and advances 24 times, ending in January 2028. It runs seeds `7, 23, 41, 89, 127` under each of two fixed decision policies. Every number in the tables is the arithmetic mean of the five seed runs for that policy. The baseline uses source from merged commit `0e4914f`; the final run uses this branch. Both use the same harness and seeds. The baseline has no staff recovery action.

Run the current model with `bun run scripts/balance-report.ts`. The script emits the means and each seed's results as JSON; `--months=12` runs the supported shorter horizon. To reproduce the baseline, check out `0e4914f` in an isolated directory, copy `src/lib/simulation/balanceHarness.ts` and `scripts/balance-report.ts` from this branch into it, and run `bun run scripts/balance-report.ts --baseline`. The `--baseline` flag omits the staff recovery action, which did not exist at that commit. The January opening snapshot is excluded from cumulative profit and event counts.

## Decision policies

| Scenario | Stewardship | Cash guard |
| --- | --- | --- |
| Raise request | Counter at +8% salary | Deny |
| Client feedback | Address | Ignore |
| New client | Pursue | Pass |
| Lease renewal | Negotiate | Move to cheaper space |
| IT vendor | Switch | Leave pending |
| Benefits increase | Absorb cost | Pass cost to staff |
| Partner distribution | Defer | Leave pending |
| Collections problem | Personal call | Formal demand |
| Budget overrun | Reallocate | Leave pending |
| Equipment failure | Temporary fix | Temporary fix |
| Tax planning | Pay full balance | Pay full balance |

Stewardship also funds staff recovery after decisions when mean employee burnout reaches 35 and the action is affordable. Cash guard never funds it. Leaving some decisions open in cash guard exercises pending inbox retention. Informational industry updates require no decision.

## Measured outcomes

Cash and profit are dollars. Cumulative profit sums the final P&L result for each of the 24 advanced months, including same-month decision costs. Minimum cash and peak credit are observed after each month transition, inbox choice, and recovery action. Gross credit draws count recorded line-of-credit draw movements.

| Policy and source | Ending cash | Minimum cash | Gross credit draws | Peak / ending credit | Cumulative profit | Ending clients | Churn | Renewals |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Stewardship, baseline | -112,612 | -112,612 | 80,000 | 80,000 / 80,000 | -384,129 | 3.6 | 9.6 | 0 |
| Stewardship, final | 640,629 | 162,305 | 0 | 0 / 0 | 568,186 | 10.6 | 3.2 | 12.6 |
| Cash guard, baseline | -496,394 | -496,394 | 100,000 | 100,000 / 100,000 | -854,597 | 0 | 8.0 | 0 |
| Cash guard, final | 168,809 | 99,234 | 20,000 | 20,000 / 20,000 | -29,022 | 4.4 | 3.6 | 9.4 |

Churn counts clients removed across the run. A renewal counts only when a client's expiring term becomes a **positive new term**. The baseline's zero renewals expose the expired contract bug; some clients stayed active at zero months and later churned, while the final model resolves each expiry.

| Policy and source | Ending mean burnout | Ending mean efficacy | Ending reputation | Staff recovery spend | Discretionary prompts | Tax prompts | Information updates |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Stewardship, baseline | 99.4 | 24.8 | 59.6 | 0 | 42.0 | 4.6 | 3.0 |
| Stewardship, final | 13.4 | 94.8 | 88.8 | 29,400 | 35.4 | 8.0 | 4.8 |
| Cash guard, baseline | 100.0 | 4.2 | 31.8 | 0 | 34.8 | 4.0 | 4.2 |
| Cash guard, final | 99.7 | 6.4 | 44.8 | 0 | 27.0 | 5.0 | 6.2 |

Discretionary prompts exclude guaranteed quarter-end tax prompts and the informational fallback. The tuned probabilities reduced discretionary prompts by about 16% in stewardship and 22% in cash guard, while still offering 1.5 and 1.1 per month respectively. Tax prompts appear at every quarter end with an outstanding balance; their counts rise in the final model because more months remain profitable.

| Policy and source | Mean pending before decisions | Mean pending after decisions | Peak pending | Ending pending |
| --- | ---: | ---: | ---: | ---: |
| Stewardship, baseline | 1.9 | 0 | 5.2 | 0 |
| Stewardship, final | 1.8 | 0 | 4.6 | 0 |
| Cash guard, baseline | 3.8 | 2.3 | 6.0 | 2.8 |
| Cash guard, final | 3.2 | 2.0 | 5.4 | 2.6 |

The mean pending values average 24 monthly snapshots per seed before averaging seeds. Peak pending is the mean of each seed's maximum, not the maximum across all seeds. The 24-month test also retains an intentionally unresolved decision through every month and verifies all eight quarter-end tax prompts when tax remains due.

## Interpretation and limits

The final stewardship policy spends about $29,400 on recovery over 24 months and ends with substantially lower burnout and higher efficacy. Contract renewal fixes account for much of the financial improvement, so the before/after cash change must not be attributed solely to recovery or inbox pacing. Same seeds make runs reproducible, but changed decisions and event counts consume random draws differently; they are not matched counterfactual histories.

The fictional model can still reach negative cash after exhausting the $100,000 credit line: final cash guard seed `23` ends at `-$19,430`. Cash guard's staff metrics also show that leaving burnout untreated remains severe. The harness is a bounded 12–24 month model check, not a prediction of player behavior, real firm finances, or tax outcomes. Human play sessions are still needed to judge whether the choices feel fair and clear.
