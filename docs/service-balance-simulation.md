# Client service balance check

These are **deterministic scripted simulations, not new-player playtest results or forecasts**. The harness starts from the January 2026 opening state and advances 24 months across seeds `7, 23, 41, 89, 127`. Each value below is the mean of five runs, rounded as shown. The opening January snapshot is excluded from cumulative profit and event counts.

Run `bun run scripts/balance-report.ts` to reproduce the full JSON report, including each seed. The policy choices are described in the [earlier cash-pressure report](balance-simulation.md#scripted-decisions). The policies do not use the manual **Run Collections** button, so this report isolates the revised staffing and retention loop; the button's monthly limit is covered by focused tests and the [new-player test script](new-player-playtest.md).

## Revised service rule

Lobbyists and attorneys provide two client slots each at 80% combined quality (70% efficacy, 30% client affinity). Burnout above 60% reduces effective slots. Support staff improve how much of that billable capacity reaches clients: without effective support the multiplier is 0.85, and it rises with support effectiveness to a 1.15 cap. The opening four billable staff and one support employee cover roughly eight clients. Each month, service coverage adjusts client satisfaction, and renewal odds are multiplied by coverage up to 100%. With no billable staff, contracts cannot renew. The dashboard and monthly alerts surface coverage shortfalls.

## Five-seed results, 24 months

| Metric | Stewardship | Cash pressure | Cash guard (no recovery) |
| --- | ---: | ---: | ---: |
| Ending cash | $457,162 | $192,823 | -$117,238 |
| Minimum cash | $162,305 | $121,901 | -$117,610 |
| Peak / ending credit drawn | $0 / $0 | $20,000 / $20,000 | $80,000 / $80,000 |
| Cumulative profit | $354,197 | $15,610 | -$444,379 |
| Ending clients | 8.6 | 5.6 | 0.4 |
| Ending effective client slots | 9.1 | 7.7 | 0.4 |
| Churn / renewals | 3.4 / 11.6 | 2.4 / 10.6 | 7.6 / 4.4 |
| Ending mean burnout / efficacy | 23.1 / 94.9 | 36.3 / 78.8 | 100.0 / 6.0 |
| Ending reputation | 92.4 | 86.2 | 21.0 |
| Recovery spend | $26,700 | $22,900 | $0 |
| Full / targeted recovery actions | 3.6 / 0.0 | 1.8 / 9.4 | 0.0 / 0.0 |
| Ending pending inbox decisions | 0.0 | 2.6 | 2.4 |

The no-recovery policy eventually loses service capacity as staff burn out. Its client base falls sharply, and mean ending cash becomes negative. The cash-pressure policy preserves more effective capacity and clients while spending on recovery. Stewardship also pursues new business and responds differently to inbox decisions, so its results should not be attributed to recovery alone.

Seed 23 shows the remaining cash risk: cash guard ends with no clients, -$191,514 cash, and a fully drawn $100,000 credit line. Cash pressure ends with five clients and $7,379 cash, but also uses the full credit line. The revised service loop does not guarantee solvency.

## What this check can and cannot establish

The tests show that staffing choices now have a consequential path to satisfaction and retention, and that the arithmetic stays consistent over long scripted runs. Five seeds and fixed policies do not establish whether new players understand, trust, or enjoy the rule, nor whether they will choose these policies. Shared seeds also need not produce matched events when decisions change random draw consumption. Run the [new-player sessions](new-player-playtest.md) before treating the balance as settled or expanding the tax and persistence models.
