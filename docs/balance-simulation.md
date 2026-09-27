# Cash pressure balance simulation

> Historical PR #7 balance snapshot. The client service rule has since changed; see the [current service balance check](service-balance-simulation.md) for results under the revised rules.

These are **deterministic simulation results, not human playtest findings**. The harness starts from the January 2026 opening state ($250,000 cash, no credit drawn, eight clients, five employees), then advances 24 months through January 2028. Each table entry is the arithmetic mean of runs with seeds `7, 23, 41, 89, 127`, unless identified as seed 23. The January opening snapshot is excluded from cumulative profit and event counts.

These recorded results came from the PR #7 rules and are retained for historical comparison. Running `bun run scripts/balance-report.ts` now uses the revised client service rules and produces the results in the [current report](service-balance-simulation.md). The `--baseline` flag remains for reproducing the older PR #6 comparison against `0e4914f` in an isolated checkout.

## Scripted decisions

The cash-guard and cash-pressure policies make identical inbox choices. They deny raises, ignore client feedback, pass on new clients, take the cheaper lease, pass benefits costs to staff, use a formal collections demand, and make temporary equipment fixes. Both pay the full outstanding tax balance when prompted and leave vendor, partner-distribution, and budget decisions pending. The stewardship reference instead counters raises, addresses feedback, pursues new clients, negotiates the lease, switches the vendor, absorbs benefits increases, defers distributions, calls on collections, and reallocates budgets; it also pays taxes and makes temporary equipment fixes.

Cash guard never funds staff recovery. Cash pressure considers recovery after inbox decisions when mean burnout reaches 35. It funds the full program only if cash after its quoted cost would cover **three months of the latest recurring cash outflow**. Otherwise it funds targeted recovery only if cash after its quoted cost would cover **one month of that outflow**. It stops discretionary recovery whenever the credit line has a balance. This reserve uses the last recorded outflow as a simple policy signal, not a forecast. The targeted quote covers up to two eligible employees at $500 each, reducing each participant's burnout by up to 15 and restoring up to 3 efficacy. Both plans share the once-per-month cooldown. Stewardship continues to use the full plan at mean burnout 35 when cash covers its quote.

## Before and after: cash guard versus cash pressure

Both policies run the same merged game rules and seeds. They differ only in their recovery decisions, so this is a **scripted policy comparison**, not evidence that a player will choose or experience the same outcome. Dollars are rounded to the nearest dollar; staff and inbox means are rounded to one decimal.

| Metric, five-seed mean | Before: cash guard | After: cash pressure |
| --- | ---: | ---: |
| Ending cash | $168,809 | $153,647 |
| Minimum cash | $99,234 | $96,520 |
| Gross credit draws | $20,000 | $27,389 |
| Peak / ending credit used | $20,000 / $20,000 | $27,389 / $27,389 |
| Cumulative profit | -$29,022 | -$51,572 |
| Ending clients | 4.4 | 4.4 |
| Client churn / renewals | 3.6 / 9.4 | 3.6 / 9.4 |
| Ending mean burnout | 99.7 | 42.0 |
| Ending mean efficacy | 6.4 | 76.1 |
| Ending reputation | 44.8 | 72.4 |
| Pending inbox before / after decisions, monthly mean | 3.2 / 2.0 | 3.2 / 2.0 |
| Peak / ending pending inbox | 5.4 / 2.6 | 5.4 / 2.6 |
| Recovery spend | $0 | $22,500 |
| Full / targeted recovery actions | 0 / 0 | 1.8 / 9.0 |

The stewardship reference remains at $640,629 ending cash, zero credit use, $568,186 cumulative profit, 3.2 churn, 13.4 ending burnout, 94.8 efficacy, 88.8 reputation, and zero ending pending messages. It spends $29,400 on full recovery. Its different client and inbox decisions make it an orientation point, not a recovery-only comparison.

Gross credit draws sum recorded draw movements. Minimum cash and peak credit include the state after each month transition, inbox choice, and recovery action. Pending before and after are monthly snapshots; peak pending is the mean of each seed's maximum. The report script prints the individual seed results as JSON.

## Seed 23: credit exhaustion and the remaining tradeoff

| Metric | Cash guard | Cash pressure |
| --- | ---: | ---: |
| Ending cash | -$19,430 | -$38,683 |
| Peak / ending credit used | $100,000 / $100,000 | $100,000 / $100,000 |
| Cumulative profit | -$322,543 | -$341,796 |
| Churn / renewals | 5 / 7 | 5 / 7 |
| Ending mean burnout / efficacy | 100 / 3.8 | 77 / 67.6 |
| Ending reputation | 46 | 72 |
| Ending pending inbox | 4 | 4 |
| Recovery spend and actions | $0; none | $19,000; two full, four targeted |

In cash guard, eight clients generate $111,000 monthly revenue against $88,881 recurring cash paid through October 2026. One client leaves in November, bringing revenue to $91,000. Two more leave by January 2027: five clients then generate $58,000 against about $85,881 recurring cash paid, **including the unchanged $15,000 monthly partner draw**. Profit turns roughly -$30,000 per month. Tax payable is zero during this 2027 slide, so unpaid tax is not the cause. Cash falls from $279,570 in January 2027 to $45,215 in September. Credit begins drawing in October 2027, reaches its $100,000 limit in December, and cash becomes negative in January 2028.

Cash pressure spends on staff before the reserve is lost, then stops. It improves staff and reputation, but the scripted policy still passes on new clients; renewal and churn counts stay the same. The recovery spend and related credit interest make seed 23's ending cash worse while the revenue shortfall remains. The smaller plan gives a bounded staff option, **not a fix for an unprofitable client portfolio**. The existing finance controls for partner draw, collections, and credit remain relevant once the warning appears.

The model uses simple fictional taxes, contract odds, cash collection rates, and staff effects. Different decisions can change random draw consumption, so shared seeds alone do not guarantee matched counterfactual histories. These 12–24 month checks are reproducible model probes, not forecasts or observations of how people play. Human play sessions are still needed to judge whether the new choice and warning are clear and fair.
