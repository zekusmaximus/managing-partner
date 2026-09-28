# Managing Partner - Project Status

## Current State

Managing Partner is a playable single-browser prototype. The dashboard, five-tab finances view, HR, clients, inbox, 34-step tutorial, and help glossary are implemented. PR #8 delivers staffing effects on client service and retention, constrained client and collections actions, and improved mobile decision and finance views. The current focused pass makes warning status and new-client pursuit costs clearer. There is no account, backend, or cross-device sync. New-player notes remain preliminary; the interface changes still need human validation.

The earlier 15–20% completion estimate and checklist described work that has since been built. Progress toward a finished game cannot be stated as a precise percentage without defining the intended feature set.

## Completed in the Stabilization Pass

- [x] Extract testable simulation transitions, inbox decisions, and P&L metrics.
- [x] Target inbox decisions to named subjects and prevent repeat actions.
- [x] Validate finite monetary inputs; correct quarter opening actuals, reallocations, margin, write-offs, and historic category totals.
- [x] Save simulation and tutorial together after hydration; restore dates; validate corrupt saves; provide confirmed New Game.
- [x] Use one responsive app shell, reachable mobile month controls, alert navigation, accessible help and inbox buttons, and a chart legend.
- [x] Align tutorial examples and spotlight actions with the displayed model and navigation.
- [x] Add focused simulation and save tests.

## Completed Second Pass

- [x] Track AR aging by client while retaining firm-wide bucket totals; keep former-client balances visible and opening/migrated balances explicitly unassigned.
- [x] Migrate validated version 1 local saves to version 2 without inventing a client for pooled historical AR.
- [x] Show the selected inbox action and its actual result in resolved messages; align choice descriptions with modeled effects.
- [x] Remove the partner view's mixed-period YTD compensation total and keep all-time distributions labeled accurately.

## Completed Cash-Flow Pass

- [x] Record recurring cash paid and signed one-time, distribution, tax, and line-of-credit movements in monthly history.
- [x] Show a categorized cash waterfall with an honest January opening snapshot; mark unexplained movement from older saves as unclassified.
- [x] Put one-time operating decisions in their own P&L category, separate from collections and cash-only financing.
- [x] Migrate validated version 1 and 2 local saves to version 3 without assigning fictional causes to old cash movements.
- [x] Complete 33 tests, typecheck, lint, build, and responsive browser checks for the cash-flow work.

## Completed Tax, Scenario, and Tutorial Pass

- [x] Add a fictional estimated tax provision, payable balance, quarter-opening late charge, and cash payments that clear penalties first.
- [x] Show the tax expense, late charge, and unpaid balance in Finances; explain that the provision is a month-opening estimate.
- [x] Migrate validated version 1–3 saves to version 4 without inventing past tax debt; expire older tax prompts that have no recorded balance.
- [x] Generate inbox scenarios with testable randomness, avoid duplicate pending decisions, preserve unresolved decisions, and broaden the new-client name pool.
- [x] Keep overdue tutorial month checkpoints from advancing the game twice, confine keyboard focus to tutorial controls and the highlighted action, and correct finance copy and repayment affordances.
- [x] Pass 51 Bun tests, typecheck, lint, and production build; check all five routes at 390, 768, 1280, and 1440px, then complete the tutorial across those widths with keyboard navigation.

## Completed Gameplay Balance Pass

- [x] Run a reproducible 24-month, five-seed simulation under stewardship and cash-guard policies; record before/after cash, credit, profit, churn, staff, reputation, and inbox metrics as model results.
- [x] Add a priced, once-per-month staff recovery program with bounded burnout and efficacy effects, explicit HR quote, P&L and cash entries, and Payroll budget actuals.
- [x] Resolve expiring client contracts into a new 12-month term or churn; show outcome alerts and keep former-client receivables collectible.
- [x] Reduce discretionary inbox prompts while preserving unresolved decisions and quarter-end tax decisions.
- [x] Keep the version 4 save format and version 1–4 compatibility; accept the additive staff-recovery cash movement and verify reload cooldown.
- [x] Pass 65 Bun tests, typecheck, lint, and production build; check all five routes at 390, 768, 1280, and 1440px, including keyboard recovery, finance tabs, renewal/churn, pending inbox and tax prompts, and reload persistence.

## Completed Cash-Constrained Play Pass

- [x] Investigate the seeded cash-guard run that exhausts its credit line and ends with severe burnout.
- [x] Add a smaller, cash-funded targeted recovery choice with an explicit per-person price, bounded effects, and the existing monthly cooldown and accounting.
- [x] Show low remaining credit on the dashboard with a direct link to the existing Cash Flow controls.
- [x] Compare seeded cash-guard and recovery-under-pressure policies across cash, credit, profit, churn, burnout, efficacy, reputation, and pending inbox volume; label these as simulation results.
- [x] Verify version 1–4 save compatibility, focused tests, Bun quality gates, and changed keyboard/reload flows at 390, 768, 1280, and 1440px.

## Client Service and Mobile Usability Pass

- [x] Link billable staffing, efficacy, affinity, and burnout to client service coverage, monthly satisfaction, and renewal odds; surface shortfalls in the dashboard and alerts.
- [x] Route client acquisition and feedback through inbox decisions instead of repeatable free client controls.
- [x] Limit manual collections to one attempt per game month, preserve the limit in existing version 4 saves, and explain it beside the action.
- [x] Put a compact decision brief and alerts above dashboard detail on phones; make finance reports selectable and year-to-date P&L readable without sideways scrolling.
- [x] Re-run the seeded balance check under the revised service rule and prepare a new-player session script.

## Interim Playtest Feedback Pass

- [x] Record the first qualitative notes: overdue and approaching-renewal warnings lacked an obvious response, and action costs and benefits were unclear, especially bad-debt write-offs.
- [x] Add a paid, once-per-month client meeting for renewal, satisfaction, service, or payment risk; show a client-specific estimate and record its cash, AR, profit, and budget effects.
- [x] Link dashboard warnings and overdue AR rows to relevant actions, and explain that warning snapshots may remain after a player responds.
- [x] Preview modeled AR write-off, collection, credit, budget, and distribution effects; clarify uncertain inbox outcomes.
- [x] Verify the new meeting and save behavior with focused tests and run the full Bun quality gate. The existing scripted balance policies do not exercise meetings and their results are unchanged.

## Focused Decision Loop Pass

- [x] Show the expiring client's monthly fee and share of current contracted monthly fees at the warning, and link to the relevant client meeting.
- [x] Separate current warning conditions from dated outcomes. Recheck saved warning snapshots against current client, AR, cash, credit, budget, and staff state so resolved conditions do not inflate the active alert count; explain how to dismiss prior outcomes.
- [x] Frame 90+ day debt as a choice between collection and giving up a balance. Keep the once-per-month meeting and collections limits and the cash, AR, and profit previews visible at the action.
- [x] Charge $3,000 cash and current-month profit for aggressive new-client pursuit whether or not the prospect signs. Show the tradeoff in new and older pending offers and record the expense in the cash waterfall and budget.
- [x] Keep phone finance reports selectable and year-to-date P&L readable; add focused playtest checks for finding AR and profit without guidance.
- [x] Pass 93 Bun tests, typecheck, lint, and production build. Check all five routes at 390, 768, 1280, and 1440px without document overflow; exercise phone keyboard navigation to finance reports, YTD P&L, renewal warnings, and client meetings, plus collections and pursuit outcomes at 390px. No browser console errors or warnings appeared.

## Next Work

- [ ] Continue first-time-player sessions using `docs/new-player-playtest.md`; verify that players can distinguish current warnings from prior outcomes, follow warnings to actions, explain the pursuit and write-off tradeoffs, and find phone finance information.
- [ ] Revisit the $3,000 pursuit price and service balance after player observations; the initial price is a game design choice, not a measured real-world cost.
- [ ] Decide whether the simplified month-opening tax estimate needs a deeper accounting model after playtesting.
- [ ] Add a documented save export/import or account sync only if play across browsers or devices becomes a requirement.

## Quality Gate

Run `bun test`, `bun typecheck`, `bun lint`, and `bun run build` before committing. Walk through all five routes and the tutorial at 390, 768, 1280, and 1440px, including keyboard navigation.
