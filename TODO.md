# Managing Partner - Project Status

## Current State

Managing Partner is a playable single-browser prototype. The dashboard, five-tab finances view, HR, clients, inbox, 34-step tutorial, and help glossary are implemented. The first two passes are merged. The current branch adds categorized cash activity, an estimated tax balance, more reliable inbox generation, and tutorial usability fixes. There is no account, backend, or cross-device sync.

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

## Cash-Flow Pass on the Current Branch

- [x] Record recurring cash paid and signed one-time, distribution, tax, and line-of-credit movements in monthly history.
- [x] Show a categorized cash waterfall with an honest January opening snapshot; mark unexplained movement from older saves as unclassified.
- [x] Put one-time operating decisions in their own P&L category, separate from collections and cash-only financing.
- [x] Migrate validated version 1 and 2 local saves to version 3 without assigning fictional causes to old cash movements.
- [x] Complete 33 tests, typecheck, lint, build, and responsive browser checks for the cash-flow work.

## Tax, Scenario, and Tutorial Pass on the Current Branch

- [x] Add a fictional estimated tax provision, payable balance, quarter-opening late charge, and cash payments that clear penalties first.
- [x] Show the tax expense, late charge, and unpaid balance in Finances; explain that the provision is a month-opening estimate.
- [x] Migrate validated version 1–3 saves to version 4 without inventing past tax debt; expire older tax prompts that have no recorded balance.
- [x] Generate inbox scenarios with testable randomness, avoid duplicate pending decisions, preserve unresolved decisions, and broaden the new-client name pool.
- [x] Keep overdue tutorial month checkpoints from advancing the game twice, confine keyboard focus to tutorial controls and the highlighted action, and correct finance copy and repayment affordances.
- [x] Pass 51 Bun tests, typecheck, lint, and production build; check all five routes at 390, 768, 1280, and 1440px, then complete the tutorial across those widths with keyboard navigation.

## Next Work

- [ ] Observe several play sessions and tune scenario frequency, choices, and financial outcomes, including persistent staff burnout.
- [ ] Decide whether the simplified month-opening tax estimate needs a deeper accounting model after playtesting.
- [ ] Add a documented save export/import or account sync only if play across browsers or devices becomes a requirement.
- [ ] Run usability sessions with new players and refine tutorial length and labels.

## Quality Gate

Run `bun test`, `bun typecheck`, `bun lint`, and `bun run build` before committing. Walk through all five routes and the tutorial at 390, 768, 1280, and 1440px, including keyboard navigation.
