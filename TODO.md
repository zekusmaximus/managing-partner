# Managing Partner - Project Status

## Current State

Managing Partner is a playable single-browser prototype. The dashboard, five-tab finances view, HR, clients, inbox, 34-step tutorial, and help glossary are implemented. The gameplay balance pass was merged as PR #6 (`fa3b6a1`), adding a seeded balance harness, staff recovery, contract expiry resolution, and inbox-frequency tuning. The current `codex/cash-pressure-recovery` branch focuses on recovery choices and visible credit pressure. There is no account, backend, or cross-device sync.

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

## Cash-Constrained Play Pass on the Current Branch

- [x] Investigate the seeded cash-guard run that exhausts its credit line and ends with severe burnout.
- [x] Add a smaller, cash-funded targeted recovery choice with an explicit per-person price, bounded effects, and the existing monthly cooldown and accounting.
- [x] Show low remaining credit on the dashboard with a direct link to the existing Cash Flow controls.
- [x] Compare seeded cash-guard and recovery-under-pressure policies across cash, credit, profit, churn, burnout, efficacy, reputation, and pending inbox volume; label these as simulation results.
- [x] Verify version 1–4 save compatibility, focused tests, Bun quality gates, and changed keyboard/reload flows at 390, 768, 1280, and 1440px.

## Next Work

- [ ] Observe human play sessions to test whether the scripted policies reflect actual player choices and adjust balance if needed.
- [ ] Decide whether the simplified month-opening tax estimate needs a deeper accounting model after playtesting.
- [ ] Add a documented save export/import or account sync only if play across browsers or devices becomes a requirement.
- [ ] Run usability sessions with new players and refine tutorial length and labels.

## Quality Gate

Run `bun test`, `bun typecheck`, `bun lint`, and `bun run build` before committing. Walk through all five routes and the tutorial at 390, 768, 1280, and 1440px, including keyboard navigation.
